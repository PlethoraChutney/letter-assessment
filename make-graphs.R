library(tidyverse)

student_data <- read_csv('student-results.csv')

processed_data <- student_data |> 
  mutate(type = category) |> 
  filter(type != 'read', student != 'Test') |> 
  mutate(category = case_when(
    str_detect('ABCDEFGHIJKLMNOPQRSTUVWXYZ', target) ~ 'Uppercase',
    target %in% 0:20 ~ 'Number',
    type == 'name' ~ 'Lowercase',
    type == 'sound' ~ 'Sound'
  )) |>
  mutate(date = as.character(date)) |> 
  separate(date, into = c('year', 'month', 'day'), sep = '-') |> 
  mutate(day = as.numeric(day)) |> 
  group_by(student, month) |> 
  filter(day == max(day)) |> 
  select(-day) |> 
  ungroup() |> 
  group_by(year, month, student, category, success) |> 
  count() |> 
  pivot_wider(names_from = success, values_from = n) |> 
  replace_na(list('TRUE' = 0, 'FALSE' = 0)) |>
  mutate(prop = `TRUE` / (`FALSE` + `TRUE`)) |>
  ungroup() |> 
  select(year, month, student, category, prop)

processed_data |> 
  mutate(month = paste(year, month, sep = '-')) |> 
  mutate(category = fct_relevel(category, 'Uppercase', 'Lowercase', 'Sound', 'Number')) |> 
  ggplot(aes(month, prop)) +
  facet_grid(rows = vars(student), cols = vars(category)) +
  theme_minimal() +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    legend.position = 'none',
    panel.spacing = unit(2, 'lines')
  ) +
  scale_y_continuous(
    sec.axis = sec_axis(~., breaks = c(0,0.5,1)),
    breaks = c(0, 0.5, 1.0)
  ) +
  geom_col(aes(fill = category), color = 'black') +
  MetBrewer::scale_fill_met_d('Johnson') +
  labs(
    x = 'Month',
    y = 'Proportion Correct'
  ) +
  expand_limits(y = 1)
ggsave('static/student_plot.svg', width = 10, height = 30)


# Table -------------------------------------------------------------------

library(gt)
library(gtExtras)

table_data <- student_data |> 
  mutate(type = category) |> 
  filter(student != 'Test') |> 
  mutate(category = case_when(
    str_detect('ABCDEFGHIJKLMNOPQRSTUVWXYZ', target) ~ 'Uppercase',
    target %in% 0:20 ~ 'Number',
    type == 'name' ~ 'Lowercase',
    type == 'sound' ~ 'Sound',
    type == 'read' ~ 'Word'
  ))

table_data |> 
  group_by(date, student, category) |> 
  rename('Date' = date) |> 
  summarize(
    Percent = round(sum(success) / n(), digits = 2),
    Success = sum(success)
  ) |>
  pivot_wider(
    names_from = category,
    values_from = c(Success, Percent),
    names_glue = "{category}.{.value}"
  ) |>
  select(
    starts_with('Number'),
    starts_with('Lowercase'),
    starts_with('Sound'),
    starts_with('Uppercase'),
    starts_with('Word')
  ) |> 
  arrange(student) |> 
  group_by(student) |> 
  gt(
    rowname_col = 'Date'
  ) |> 
  tab_spanner_delim(delim = '.') |> 
  fmt_percent(
    columns = contains('Percent'),
    decimals = 0
  ) |> 
  gt_color_rows(
    contains('Percent'),
    palette = 'Blues',
    domain = c(0, 1)
  ) |> 
  gt_color_rows(
    c('Number.Success'),
    palette = 'Blues',
    domain = 0:21
  ) |> 
  gt_color_rows(
    c('Lowercase.Success', 'Sound.Success', 'Uppercase.Success'),
    palette = 'Blues',
    domain = 0:26
  ) |> 
  gt_color_rows(
    'Word.Success',
    palette = 'Blues',
    domain = 0:4
  ) |> 
  fmt_number(
    'Number.Success',
    decimals = 0,
    pattern = '{x}/21'
  ) |> 
  fmt_number(
    c('Lowercase.Success', 'Sound.Success', 'Uppercase.Success'),
    decimals = 0,
    pattern = '{x}/26'
  ) |> 
  fmt_number(
    'Word.Success',
    decimals = 0,
    pattern = '{x}/4'
  ) |> 
  tab_options(
    row_group.border.top.width = 2,
    row_group.border.bottom.width = 0,
    table_body.hlines.color = 'white',
    table_body.vlines.color = 'white',
    stub.border.width = 0
  )
