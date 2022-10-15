library(tidyverse)

student_data <- read_csv('student-results.csv')

processed_data <- student_data |> 
  mutate(type = category) |> 
  filter(type != 'read') |> 
  mutate(category = case_when(
    str_detect('ABCDEFGHIJKLMNOPQRSTUVWXYZ', target) ~ 'Uppercase',
    target %in% 1:20 ~ 'Number',
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
    legend.position = 'none'
  ) +
  scale_y_continuous(
    sec.axis = sec_axis(~.),
    breaks = c(0, 0.5, 1.0)
  ) +
  geom_col(aes(fill = category), color = 'black') +
  MetBrewer::scale_fill_met_d('Johnson') +
  labs(
    x = 'Month',
    y = 'Proportion Correct'
  ) +
  expand_limits(y = 1)
ggsave('static/student_plot.svg', width = 10, height = 20)
