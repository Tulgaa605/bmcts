export type DestKind = 'sum' | 'duureg' | 'salbar';

export const DEST_KIND_LABEL: Record<DestKind, string> = {
  sum: 'Сум',
  duureg: 'Дүүрэг',
  salbar: 'Салбар',
};

export type DestinationOption = {
  id: string;
  kind: DestKind;
  name: string;
  linkedOrgId?: number;
};
