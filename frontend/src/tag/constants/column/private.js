export const PRIVATE_COLUMN_KEY = {
  ID: '_id',

  // base key
  CTIME: '_ctime',
  MTIME: '_mtime',
  CREATOR: '_creator',
  LAST_MODIFIER: '_last_modifier',
  TAG_NAME: '_tag_name',
  TAG_COLOR: '_tag_color',
  TAG_FILE_LINKS: '_tag_file_links',
  PARENT_LINKS: '_tag_parent_links',
  SUB_LINKS: '_tag_sub_links',
};

export const PRIVATE_COLUMN_KEYS = [
  PRIVATE_COLUMN_KEY.ID,
  PRIVATE_COLUMN_KEY.CTIME,
  PRIVATE_COLUMN_KEY.MTIME,
  PRIVATE_COLUMN_KEY.CREATOR,
  PRIVATE_COLUMN_KEY.LAST_MODIFIER,
  PRIVATE_COLUMN_KEY.TAG_NAME,
  PRIVATE_COLUMN_KEY.TAG_COLOR,
  PRIVATE_COLUMN_KEY.TAG_FILE_LINKS,
  PRIVATE_COLUMN_KEY.PARENT_LINKS,
  PRIVATE_COLUMN_KEY.SUB_LINKS,
];

export const EDITABLE_PRIVATE_COLUMN_KEYS = [
  PRIVATE_COLUMN_KEY.TAG_NAME,
  PRIVATE_COLUMN_KEY.TAG_COLOR,
  PRIVATE_COLUMN_KEY.TAG_FILE_LINKS,
];

export const VISIBLE_COLUMNS_KEYS = [
  PRIVATE_COLUMN_KEY.TAG_NAME, PRIVATE_COLUMN_KEY.PARENT_LINKS, PRIVATE_COLUMN_KEY.SUB_LINKS, PRIVATE_COLUMN_KEY.TAG_FILE_LINKS,
];
