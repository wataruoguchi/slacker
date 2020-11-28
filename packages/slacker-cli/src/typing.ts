export type channel = {
  id: string;
  name: string;
  name_normalized: string;
  is_archived: boolean;
  is_general: boolean;
  is_private: boolean;
};

export type message = {
  type: string;
  subtype: string;
  text: string;
  ts: number;
};

export type user = {
  id: string;
  name: string;
  is_bot: boolean;
};
