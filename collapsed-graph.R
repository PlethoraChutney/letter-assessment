library(tidyverse)
library(gt)
library(gtExtras)

student_data <- read_csv("student-results.csv")

# Table -------------------------------------------------------------------

table_data <- student_data |>
  pivot_longer(cols = !quiz_type:type, names_to = "student", values_to = "success") |>
  filter(student != "Test") |>
  mutate(category = case_when(
    quiz_type == "upper" & type == "sound" ~ "Sound",
    quiz_type == "upper" & type == "name" ~ "Uppercase",
    quiz_type == "lower" ~ "Lowercase",
    quiz_type == "numbers" ~ "Number",
    quiz_type == "words" ~ "Words",
    TRUE ~ paste(quiz_type, type)
  ))

ensure_all_columns <- function(data) {
  types <- c('Uppercase', 'Lowercase', 'Sound', 'Words', 'Number')
  necessary_columns <- paste(
    rep(types, each = 2),
    rep(c('Percent', 'Success'), times = length(types)),
    sep = '.'
  )
  
  for (column_name in necessary_columns) {
    if (!(column_name %in% colnames(data))) {
      column_name = enquo(column_name)
      data <- data |> 
        mutate(!!column_name := NA)
    }
  }
  
  data
}

table_data |>
  group_by(date, student, category) |>
  rename("Date" = date) |>
  summarize(
    Percent = round(sum(success) / n(), digits = 2),
    Success = sum(success),
    .groups = "keep"
  ) |>
  # collapse all to first of the month
  filter(!is.na(Percent)) |> 
  group_by(student, category) |> 
  filter(Date == max(Date)) |> 
  mutate(Date = floor_date(Date, unit = 'months')) |> 
  pivot_wider(
    names_from = category,
    values_from = c(Success, Percent),
    names_glue = "{category}.{.value}"
  ) |> 
  ensure_all_columns() |>
  select(
    Date,
    student,
    ends_with('Percent'),
    ends_with('Success')
  ) |> 
  arrange(student) |>
  group_by(student) |> 
  filter(
    !if_all(
      contains('Success'),
      is.na
    )
  ) |> 
  relocate(
    Date,
    student,
    contains('Lowercase'),
    contains('Uppercase'),
    contains('Sound'),
    contains('Number'),
    contains('Words')
  ) |> 
  gt(
    rowname_col = "Date"
  ) |>
  tab_spanner_delim(delim = ".") |>
  fmt_percent(
    columns = contains("Percent"),
    decimals = 0
  ) |>
  fmt_number(
    "Number.Success",
    decimals = 0,
    pattern = "{x}/21"
  ) |>
  fmt_number(
    c("Lowercase.Success", "Sound.Success", "Uppercase.Success"),
    decimals = 0,
    pattern = "{x}/26"
  ) |>
  fmt_number(
    "Words.Success",
    decimals = 0,
    pattern = "{x}/4"
  ) |>
  fmt_date(
    columns = 'Date',
    date_style = 'month'
  ) |> 
  tab_options(
    row_group.border.top.width = 2,
    row_group.border.bottom.width = 0,
    table_body.hlines.color = "white",
    table_body.vlines.color = "white",
    stub.border.width = 0
  ) |>
  # apply this to all NA cells first, because if there are *no* non-NA values
  # the NA color never gets applied.
  data_color(
    na_color = '#EFEFEF'
  ) |> 
  data_color(
    method = 'numeric',
    na_color= '#EFEFEF',
    columns = contains("Percent"),
    palette = "Blues",
    domain = c(0, 1)
  ) |>
  data_color(
    method = 'numeric',
    na_color= '#EFEFEF',
    columns = c("Lowercase.Success", "Sound.Success", "Uppercase.Success"),
    palette = "Blues",
    domain = 0:26
  ) |>
  data_color(
    method = 'numeric',
    na_color= '#EFEFEF',
    columns = c("Number.Success"),
    palette = "Blues",
    domain = 0:21
  ) |>
  data_color(
    method = 'numeric',
    na_color= '#EFEFEF',
    columns = "Words.Success",
    palette = "Blues",
    domain = 0:4
  ) |> 
  sub_missing() |> 
  gtsave(
    "static/student_table.html"
  )
