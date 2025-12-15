export type VersionFormValues = {
  template: string;
  system_prompt?: string;
  negative_prompt?: string;
  input_schema?: string;
  sampling_params?: string;
  timeout_ms?: number;
  changelog?: string;
};

export type TestFormValues = {
  variables?: string;
  model_provider?: string;
  model_name?: string;
};
