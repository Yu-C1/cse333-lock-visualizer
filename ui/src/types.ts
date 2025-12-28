import { Event } from "core/model/Event";

export type UiState = {
  errors?: string[];
  deadlock?: boolean;
  race?: boolean;
  events?: Event[];
};
