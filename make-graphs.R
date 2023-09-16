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

table_data |>
  group_by(date, student, category) |>
  rename("Date" = date) |>
  summarize(
    Percent = round(sum(success) / n(), digits = 2),
    Success = sum(success),
    .groups = "keep"
  ) |>
  pivot_wider(
    names_from = category,
    values_from = c(Success, Percent),
    names_glue = "{category}.{.value}"
  ) |>
  select(
    starts_with("Uppercase"),
    starts_with("Lowercase"),
    starts_with("Sound"),
    starts_with("Number"),
    starts_with("Word")
  ) |>
  arrange(student) |>
  group_by(student) |>
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
  tab_options(
    row_group.border.top.width = 2,
    row_group.border.bottom.width = 0,
    table_body.hlines.color = "white",
    table_body.vlines.color = "white",
    stub.border.width = 0
  ) |>
  data_color(
    columns = contains("Percent"),
    palette = "Blues",
    domain = c(0, 1),
    na_color = "#E2E2E2"
  ) |>
  data_color(
    columns = c("Lowercase.Success", "Sound.Success", "Uppercase.Success"),
    palette = "Blues",
    domain = 0:26,
    na_color = "#E2E2E2"
  ) |>
  data_color(
    columns = c("Number.Success"),
    palette = "Blues",
    domain = 0:21,
    na_color = "#E2E2E2"
  ) |>
  data_color(
    columns = "Words.Success",
    palette = "Blues",
    domain = 0:4,
    na_color = "#E2E2E2"
  ) |>
  sub_missing() |>
  gtsave(
    "static/student_table.html"
  )
