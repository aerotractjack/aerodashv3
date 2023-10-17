export const apiUrl = "http://127.0.0.1:5055/api/"

export const createTables = {
    "New Client": "clients",
    "New Project": "projects",
    "New Stand": "stands",
};

export const viewTables = {
    "View Clients": "clients",
    "View Projects": "projects",
    "View Stands": "stands",
    "View Flights": "flights",
    "View GIS Table": "flight_files",
    "View AI Table": "flight_ai",
    "Overview Tab": "james",
    "Table Descriptions": "friendly_column_names"
};

export const colOrder = [
    "CLIENT_ID",
    "CLIENT_NAME",
    "CLIENT_ABBR",
    "CATEGORY",
    "CLIENT_CREATION_DATE",
    "CLIENT_NOTES",

    "PROJECT_ID",
    "PROJECT_NAME",
    "PROJECT_ABBR",
    "PROJECT_CREATION_DATE",
    "PROJECT_NOTES",
    "PROJECT_QUESTIONS",
    "DUE_DATE",
    "PROJECT_STATUS",

    "STAND_ID",
    "STAND_PERSISTENT_ID",
    "STAND_NAME",
    "STAND_ABBR",
    "ACRES",

    "FLIGHT_ID",
    "FLIGHT_KML",
    "FLIGHT_PLAN",
    "FLIGHT_COMPLETE",

    "FILES_FLIGHT_ID",
    "IMAGES_UPLOADED",
    "SHP_UPLOADED",
    "ORTHO_MAX_RES",
    "ORTHO_LOW_RES",
    "AUTO_AOIS",
    "AI_READY",
    "AI_IN_PROGRESS",
    "TRAINING_DATA_REQUESTED",
    "TRAINING_DATA_COMPLETE",
    "QC_READY",
    "QC_DONE",
    "HEATMAPS_CREATED",
    "HEATMAPS_QC",

    "AI_FLIGHT_ID",

    "FRIENDLY_NAME",
    "TABLE_NAME",
    "DB_NAME",
    "NOTES",
    "RENDER"
]