#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const loadBcrypt = () => {
  try {
    return require("bcrypt");
  } catch {
    try {
      return require("bcryptjs");
    } catch {
      console.error("Не знайдено bcrypt або bcryptjs.");
      console.error("Виконай у postline-backend:");
      console.error("npm install");
      process.exit(1);
    }
  }
};

const bcrypt = loadBcrypt();

const DEFAULT_SHIPMENT_COUNT = 1000;
const DEMO_PASSWORD = "Password1!";

const BASE_IDS = {
  departments: 1000,
  users: 100000,
  tariffs: 200000,
  shipments: 300000,
  processingEvents: 400000,
  courierDeliveries: 500000,
  routes: 600000,
  notifications: 900000,
};

const SHIPMENT_TYPES = ["letter", "parcel", "package"];
const SIZE_CATEGORIES = ["S", "M", "L", "XL"];

const STATUS_FLOW = {
  accepted: ["accepted"],
  sorting: ["accepted", "sorting"],
  in_transit: ["accepted", "sorting", "in_transit"],
  arrived: ["accepted", "sorting", "in_transit", "arrived"],
  ready_for_pickup: ["accepted", "sorting", "in_transit", "arrived", "ready_for_pickup"],
  delivered: ["accepted", "sorting", "in_transit", "arrived", "ready_for_pickup", "delivered"],
  returned: ["accepted", "sorting", "in_transit", "returned"],
  cancelled: ["accepted", "cancelled"],
};

const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

const FIRST_NAMES_MALE = [
  "Андрій", "Олександр", "Максим", "Дмитро", "Назар", "Богдан", "Іван",
  "Владислав", "Юрій", "Роман", "Олег", "Тарас", "Віктор", "Михайло",
  "Сергій", "Павло", "Денис", "Артем", "Василь", "Ростислав",
];

const FIRST_NAMES_FEMALE = [
  "Олена", "Марія", "Анна", "Софія", "Катерина", "Ірина", "Наталія",
  "Юлія", "Вікторія", "Христина", "Оксана", "Тетяна", "Дарина",
  "Анастасія", "Вероніка", "Леся", "Зоряна", "Галина", "Надія", "Лілія",
];

const LAST_NAMES_MALE = [
  "Бондаренко", "Шевченко", "Коваль", "Мельник", "Ткаченко", "Кравченко",
  "Олійник", "Поліщук", "Литвин", "Мороз", "Савчук", "Петренко",
  "Романюк", "Ковальчук", "Гончар", "Білик", "Клименко", "Захарченко",
  "Данилюк", "Марченко", "Ткачук", "Бойко", "Козак", "Павленко",
];

const LAST_NAMES_FEMALE = [
  "Бондаренко", "Шевченко", "Коваль", "Мельник", "Ткаченко", "Кравченко",
  "Олійник", "Поліщук", "Литвин", "Мороз", "Савчук", "Петренко",
  "Романюк", "Ковальчук", "Гончар", "Білик", "Клименко", "Захарченко",
  "Данилюк", "Марченко", "Ткачук", "Бойко", "Козак", "Павленко",
];

const PATRONYMICS_MALE = [
  "Андрійович", "Олександрович", "Михайлович", "Іванович", "Петрович",
  "Васильович", "Романович", "Юрійович", "Сергійович", "Богданович",
];

const PATRONYMICS_FEMALE = [
  "Андріївна", "Олександрівна", "Михайлівна", "Іванівна", "Петрівна",
  "Василівна", "Романівна", "Юріївна", "Сергіївна", "Богданівна",
];

const REAL_ADDRESSES_BY_CITY = {
  "Київ": [
    "Київ, Хрещатик, 22",
    "Київ, вул. Велика Васильківська, 57",
    "Київ, вул. Саксаганського, 85",
    "Київ, вул. Ярославів Вал, 15",
    "Київ, вул. Антоновича, 50",
    "Київ, просп. Берестейський, 37",
    "Київ, вул. Володимирська, 40",
    "Київ, вул. Богдана Хмельницького, 30",
    "Київ, вул. Михайлівська, 12",
    "Київ, вул. Межигірська, 24",
  ],

  "Львів": [
    "Львів, просп. Свободи, 15",
    "Львів, вул. Городоцька, 85",
    "Львів, вул. Зелена, 109",
    "Львів, вул. Стрийська, 45",
    "Львів, вул. Наукова, 7",
    "Львів, вул. Івана Франка, 20",
    "Львів, пл. Ринок, 1",
    "Львів, вул. Княгині Ольги, 100",
    "Львів, вул. Шевченка, 60",
    "Львів, вул. Личаківська, 75",
  ],

  "Одеса": [
    "Одеса, вул. Дерибасівська, 10",
    "Одеса, вул. Пушкінська, 15",
    "Одеса, вул. Рішельєвська, 24",
    "Одеса, просп. Шевченка, 4",
    "Одеса, вул. Канатна, 42",
    "Одеса, вул. Преображенська, 34",
    "Одеса, вул. Велика Арнаутська, 55",
    "Одеса, Французький бульвар, 24",
    "Одеса, вул. Катерининська, 27",
    "Одеса, вул. Маразліївська, 1",
  ],

  "Дніпро": [
    "Дніпро, просп. Дмитра Яворницького, 40",
    "Дніпро, вул. Короленка, 3",
    "Дніпро, вул. Січеславська Набережна, 29",
    "Дніпро, просп. Гагаріна, 72",
    "Дніпро, вул. Робоча, 89",
    "Дніпро, вул. Калинова, 12",
    "Дніпро, вул. Титова, 36",
    "Дніпро, просп. Поля, 27",
    "Дніпро, вул. Старокозацька, 52",
    "Дніпро, вул. Набережна Перемоги, 44",
  ],

  "Харків": [
    "Харків, вул. Сумська, 25",
    "Харків, просп. Науки, 14",
    "Харків, вул. Пушкінська, 50",
    "Харків, вул. Полтавський Шлях, 57",
    "Харків, просп. Героїв Харкова, 144",
    "Харків, вул. Клочківська, 197",
    "Харків, вул. Академіка Павлова, 120",
    "Харків, майдан Конституції, 1",
    "Харків, вул. Чернишевська, 13",
    "Харків, вул. Ярослава Мудрого, 30",
  ],

  "Вінниця": [
    "Вінниця, вул. Соборна, 8",
    "Вінниця, вул. Пирогова, 39",
    "Вінниця, вул. Київська, 50",
    "Вінниця, вул. Келецька, 57",
    "Вінниця, просп. Космонавтів, 23",
    "Вінниця, вул. Замостянська, 26",
    "Вінниця, вул. Грушевського, 38",
    "Вінниця, вул. Театральна, 20",
    "Вінниця, вул. Хмельницьке шосе, 95",
    "Вінниця, вул. Магістратська, 80",
  ],

  "Полтава": [
    "Полтава, вул. Європейська, 12",
    "Полтава, вул. Соборності, 45",
    "Полтава, вул. Шевченка, 52",
    "Полтава, вул. Пушкіна, 88",
    "Полтава, вул. Зіньківська, 6",
    "Полтава, вул. Маршала Бірюзова, 32",
    "Полтава, вул. Небесної Сотні, 17",
    "Полтава, вул. Гоголя, 22",
    "Полтава, вул. Великотирнівська, 35",
    "Полтава, вул. Котляревського, 6",
  ],

  "Чернігів": [
    "Чернігів, просп. Миру, 33",
    "Чернігів, вул. Шевченка, 36",
    "Чернігів, вул. Гетьмана Полуботка, 18",
    "Чернігів, вул. Рокоссовського, 20",
    "Чернігів, вул. Київська, 14",
    "Чернігів, вул. П’ятницька, 50",
    "Чернігів, вул. Івана Мазепи, 55",
    "Чернігів, вул. Любецька, 76",
    "Чернігів, вул. Незалежності, 32",
    "Чернігів, вул. Коцюбинського, 49",
  ],

  "Івано-Франківськ": [
    "Івано-Франківськ, вул. Незалежності, 18",
    "Івано-Франківськ, вул. Галицька, 22",
    "Івано-Франківськ, вул. Коновальця, 35",
    "Івано-Франківськ, вул. Січових Стрільців, 15",
    "Івано-Франківськ, вул. Дністровська, 26",
    "Івано-Франківськ, вул. Мазепи, 72",
    "Івано-Франківськ, вул. Чорновола, 11",
    "Івано-Франківськ, вул. Вовчинецька, 34",
    "Івано-Франківськ, вул. Тичини, 8",
    "Івано-Франківськ, вул. Бельведерська, 10",
  ],

  "Тернопіль": [
    "Тернопіль, вул. Руська, 20",
    "Тернопіль, вул. Текстильна, 28",
    "Тернопіль, вул. Київська, 10",
    "Тернопіль, просп. Степана Бандери, 34",
    "Тернопіль, вул. Живова, 15",
    "Тернопіль, вул. Замкова, 14",
    "Тернопіль, вул. Шептицького, 20",
    "Тернопіль, вул. Микулинецька, 46",
    "Тернопіль, вул. Грушевського, 8",
    "Тернопіль, вул. Сагайдачного, 6",
  ],
};

const courierAddressCountersByCity = new Map();

const realFullName = (index) => {
  const isFemale = index % 2 === 0;

  const firstNames = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
  const lastNames = isFemale ? LAST_NAMES_FEMALE : LAST_NAMES_MALE;
  const patronymics = isFemale ? PATRONYMICS_FEMALE : PATRONYMICS_MALE;

  const lastName = lastNames[index % lastNames.length];
  const firstName = firstNames[(index * 3 + 5) % firstNames.length];
  const patronymic = patronymics[(index * 7 + 2) % patronymics.length];

  return `${lastName} ${firstName} ${patronymic}`;
};

const addressInCity = (city, index) => {
  const addresses = REAL_ADDRESSES_BY_CITY[city];

  if (!addresses || addresses.length === 0) {
    throw new Error(`No real address whitelist for city: ${city}`);
  }

  const mixedIndex = Math.abs((index * 37 + Math.floor(index / 10) * 17) % addresses.length);

  return addresses[mixedIndex];
};

const nextCourierAddressInCity = (city) => {
  const addresses = REAL_ADDRESSES_BY_CITY[city];

  if (!addresses || addresses.length === 0) {
    throw new Error(`No real address whitelist for city: ${city}`);
  }

  const currentIndex = courierAddressCountersByCity.get(city) || 0;
  courierAddressCountersByCity.set(city, currentIndex + 1);

  return addresses[currentIndex % addresses.length];
};

const args = process.argv.slice(2);

const getArgValue = (name, shortName) => {
  const longIndex = args.indexOf(name);
  if (longIndex !== -1) return args[longIndex + 1];

  const shortIndex = shortName ? args.indexOf(shortName) : -1;
  if (shortIndex !== -1) return args[shortIndex + 1];

  return null;
};

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage:
  node db/generate-test-data.js
  node db/generate-test-data.js --shipments 5000
  node db/generate-test-data.js --shipments 5000 --out large-test-data.sql

Options:
  --shipments, -n   Number of shipments to generate. Minimum: 1000. Default: ${DEFAULT_SHIPMENT_COUNT}
  --out, -o         Output SQL filename inside the db folder. Default: test-data.sql

Generated user password:
  ${DEMO_PASSWORD}
`);
  process.exit(0);
}

const requestedShipmentCount = Number(getArgValue("--shipments", "-n"));

const shipmentCount =
  Number.isInteger(requestedShipmentCount) && requestedShipmentCount >= 1000
    ? requestedShipmentCount
    : DEFAULT_SHIPMENT_COUNT;

const outputFileName = getArgValue("--out", "-o") || "test-data.sql";
const outputPath = path.resolve(__dirname, outputFileName);

const escapeSqlString = (value) => String(value).replace(/'/g, "''");

const sql = (value) => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${escapeSqlString(value)}'`;
};

const pad = (value, length) => String(value).padStart(length, "0");

const formatTimestamp = (date) => {
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1, 2);
  const dd = pad(date.getUTCDate(), 2);
  const hh = pad(date.getUTCHours(), 2);
  const mi = pad(date.getUTCMinutes(), 2);
  const ss = pad(date.getUTCSeconds(), 2);
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);
const phone = (sequence) => `+380${500000000 + sequence}`;
const money = (value) => Number(value).toFixed(2);

const outputLines = [];

const emit = (text = "") => {
  outputLines.push(text);
};

const chunk = (rows, size) => {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
};

const emitInsert = (tableName, columns, rows, batchSize = 400) => {
  if (rows.length === 0) return;

  for (const batch of chunk(rows, batchSize)) {
    emit(`INSERT INTO ${tableName} (${columns.join(", ")}) VALUES`);
    emit(
      batch
        .map((row) => `  (${columns.map((column) => sql(row[column])).join(", ")})`)
        .join(",\n")
    );
    emit("ON CONFLICT DO NOTHING;");
    emit();
  }
};

const emitTriggerState = (tableName, triggerName, enabled) => {
  const action = enabled ? "ENABLE" : "DISABLE";

  emit("DO $$");
  emit("BEGIN");
  emit("  IF EXISTS (");
  emit("    SELECT 1");
  emit("    FROM pg_trigger");
  emit(`    WHERE tgrelid = '${tableName}'::regclass`);
  emit(`      AND tgname = '${triggerName}'`);
  emit("  ) THEN");
  emit(`    EXECUTE 'ALTER TABLE ${tableName} ${action} TRIGGER ${triggerName}';`);
  emit("  END IF;");
  emit("END $$;");
  emit();
};

const emitShipmentStatusTriggerFunction = () => {
  emit("CREATE OR REPLACE FUNCTION public.fn_log_status_change() RETURNS trigger");
  emit("    LANGUAGE plpgsql");
  emit("    AS $$");
  emit("BEGIN");
  emit("    IF TG_OP = 'INSERT' THEN");
  emit("        INSERT INTO public.processing_events (");
  emit("            shipment_id,");
  emit("            department_id,");
  emit("            operator_id,");
  emit("            status_set");
  emit("        ) VALUES (");
  emit("            NEW.id,");
  emit("            NEW.current_dept_id,");
  emit("            NULLIF(current_setting('app.current_user_id', TRUE), '')::INT,");
  emit("            NEW.status");
  emit("        );");
  emit("    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN");
  emit("        INSERT INTO public.processing_events (");
  emit("            shipment_id,");
  emit("            department_id,");
  emit("            operator_id,");
  emit("            status_set");
  emit("        ) VALUES (");
  emit("            NEW.id,");
  emit("            NEW.current_dept_id,");
  emit("            NULLIF(current_setting('app.current_user_id', TRUE), '')::INT,");
  emit("            NEW.status");
  emit("        );");
  emit("    END IF;");
  emit("    RETURN NEW;");
  emit("END;");
  emit("$$;");
  emit();
};

const chooseStatus = (index) => {
  if (index % 29 === 0) return "cancelled";
  if (index % 23 === 0) return "returned";
  if (index % 7 === 0) return "delivered";
  if (index % 5 === 0) return "ready_for_pickup";
  if (index % 3 === 0) return "in_transit";
  if (index % 2 === 0) return "sorting";
  return "accepted";
};

const currentDepartmentForStatus = (status, originDeptId, destDeptId) => {
  if (["arrived", "ready_for_pickup", "delivered"].includes(status)) {
    return destDeptId;
  }

  return originDeptId;
};

const departmentForEvent = (status, originDeptId, destDeptId) => {
  if (["arrived", "ready_for_pickup", "delivered"].includes(status)) {
    return destDeptId;
  }

  return originDeptId;
};

const eventNote = (status) => {
  const notes = {
    accepted: "Відправлення прийнято у початковому відділенні",
    sorting: "Відправлення передано на сортування",
    in_transit: "Відправлення відправлено до міста призначення",
    arrived: "Відправлення прибуло у відділення призначення",
    ready_for_pickup: "Відправлення готове до видачі одержувачу",
    delivered: "Відправлення вручено одержувачу",
    returned: "Відправлення повернено через проблему доставки",
    cancelled: "Відправлення скасовано до початку обробки",
  };

  return notes[status] || null;
};

const departments = [
  ["Київ", "Хрещатик, 1", "sorting_center"],
  ["Львів", "просп. Свободи, 15", "post_office"],
  ["Одеса", "вул. Дерибасівська, 10", "post_office"],
  ["Дніпро", "просп. Дмитра Яворницького, 40", "sorting_center"],
  ["Харків", "вул. Сумська, 25", "post_office"],
  ["Вінниця", "вул. Соборна, 8", "post_office"],
  ["Полтава", "вул. Європейська, 12", "post_office"],
  ["Чернігів", "просп. Миру, 33", "post_office"],
  ["Івано-Франківськ", "вул. Незалежності, 18", "post_office"],
  ["Тернопіль", "вул. Руська, 20", "post_office"],
].map(([city, address, type], index) => ({
  id: BASE_IDS.departments + index + 1,
  city,
  address,
  type,
  phone: phone(1000 + index),
  opening_time: "09:00:00",
  closing_time: "18:00:00",
  deleted_at: null,
}));

const users = [];

users.push({
  id: BASE_IDS.users + 1,
  role: "admin",
  department_id: null,
  full_name: "Шевченко Назарій Ярославович",
  phone: phone(1),
  email: "test.admin@example.test",
  password_hash: PASSWORD_HASH,
  created_at: "2026-01-01 08:00:00",
  deleted_at: null,
});

const operators = departments.map((department, index) => ({
  id: BASE_IDS.users + 100 + index + 1,
  role: "operator",
  department_id: department.id,
  full_name: realFullName(100 + index),
  phone: phone(100 + index + 1),
  email: `test.operator${pad(index + 1, 2)}@example.test`,
  password_hash: PASSWORD_HASH,
  created_at: "2026-01-01 08:00:00",
  deleted_at: null,
}));

users.push(...operators);

const couriers = departments.map((department, index) => ({
  id: BASE_IDS.users + 200 + index + 1,
  role: "courier",
  department_id: department.id,
  full_name: realFullName(200 + index),
  phone: phone(200 + index + 1),
  email: `test.courier${pad(index + 1, 2)}@example.test`,
  password_hash: PASSWORD_HASH,
  created_at: "2026-01-01 08:00:00",
  deleted_at: null,
}));

users.push(...couriers);

const operatorByDepartmentId = new Map(
  operators.map((operator) => [operator.department_id, operator])
);

const courierByDepartmentId = new Map(
  couriers.map((courier) => [courier.department_id, courier])
);

const operatorForDepartment = (departmentId) => {
  const operator = operatorByDepartmentId.get(departmentId);
  if (!operator) throw new Error(`No operator for department ${departmentId}`);
  return operator;
};

const courierForDepartment = (departmentId) => {
  const courier = courierByDepartmentId.get(departmentId);
  if (!courier) throw new Error(`No courier for department ${departmentId}`);
  return courier;
};

const clientCount = Math.max(260, Math.ceil(shipmentCount / 4));

const clients = Array.from({ length: clientCount }, (_, index) => ({
  id: BASE_IDS.users + 1000 + index + 1,
  role: "client",
  department_id: null,
  full_name: realFullName(1000 + index),
  phone: phone(1000 + index + 1),
  email: `test.client${pad(index + 1, 4)}@example.test`,
  password_hash: PASSWORD_HASH,
  created_at: formatTimestamp(addMinutes(new Date(Date.UTC(2026, 0, 1, 8, 0, 0)), index)),
  deleted_at: null,
}));

users.push(...clients);

const tariffs = [];
const tariffByKey = new Map();
let tariffId = BASE_IDS.tariffs + 1;

for (const cityFrom of departments.map((department) => department.city)) {
  for (const cityTo of departments.map((department) => department.city)) {
    for (const shipmentType of SHIPMENT_TYPES) {
      for (const sizeCategory of SIZE_CATEGORIES) {
        const typeFactor = SHIPMENT_TYPES.indexOf(shipmentType) + 1;
        const sizeFactor = SIZE_CATEGORIES.indexOf(sizeCategory) + 1;

        const row = {
          id: tariffId++,
          city_from: cityFrom,
          city_to: cityTo,
          shipment_type: shipmentType,
          size_category: sizeCategory,
          base_price: money(35 + typeFactor * 12 + sizeFactor * 8),
          price_per_kg: money(7 + typeFactor * 2 + sizeFactor),
          deleted_at: null,
          courier_base_fee: money(20 + sizeFactor * 3),
          courier_fee_per_kg: money(2 + typeFactor),
        };

        tariffs.push(row);
        tariffByKey.set(`${cityFrom}|${cityTo}|${shipmentType}|${sizeCategory}`, row);
      }
    }
  }
}

const routes = [];
const routeStops = [];
let routeId = BASE_IDS.routes + 1;

for (const startDepartment of departments) {
  for (const endDepartment of departments) {
    if (startDepartment.id === endDepartment.id) continue;

    const distanceKm = Number(
      (45 + Math.abs(startDepartment.id - endDepartment.id) * 12.5 + ((startDepartment.id + endDepartment.id) % 37)).toFixed(2)
    );

    const route = {
      id: routeId++,
      start_dept_id: startDepartment.id,
      end_dept_id: endDepartment.id,
      distance_km: money(distanceKm),
      est_time_hours: Number((distanceKm / 55).toFixed(1)),
      deleted_at: null,
    };

    routes.push(route);

    routeStops.push({
      route_id: route.id,
      department_id: startDepartment.id,
      sequence_order: 1,
      distance_from_prev_km: null,
    });

    routeStops.push({
      route_id: route.id,
      department_id: endDepartment.id,
      sequence_order: 2,
      distance_from_prev_km: route.distance_km,
    });
  }
}

const routeByDepartments = new Map(
  routes.map((route) => [`${route.start_dept_id}|${route.end_dept_id}`, route])
);

const shipments = [];
const shipmentDetails = [];
const processingEvents = [];
const courierDeliveries = [];
const notifications = [];

let processingEventId = BASE_IDS.processingEvents + 1;
let courierDeliveryId = BASE_IDS.courierDeliveries + 1;
let notificationId = BASE_IDS.notifications + 1;

const shipmentNotificationContent = {
  ready_for_pickup: {
    title: "Відправлення готове до видачі",
    message: (trackingNumber) => `Відправлення ${trackingNumber} готове до видачі у відділенні призначення.`,
  },
  delivered: {
    title: "Відправлення доставлено",
    message: (trackingNumber) => `Відправлення ${trackingNumber} успішно доставлено.`,
  },
  returned: {
    title: "Відправлення повертається",
    message: (trackingNumber) => `Відправлення ${trackingNumber} повертається відправнику.`,
  },
  cancelled: {
    title: "Відправлення скасовано",
    message: (trackingNumber) => `Відправлення ${trackingNumber} скасовано.`,
  },
};

const notificationRecipients = (senderId, receiverId) =>
  Array.from(new Set([senderId, receiverId].filter(Boolean)));

const pushNotificationsForRecipients = ({
  shipmentId,
  recipientIds,
  type,
  title,
  message,
  metadata,
  readAt = null,
  createdAt,
}) => {
  recipientIds.forEach((recipientId) => {
    notifications.push({
      id: notificationId++,
      shipment_id: shipmentId,
      recipient_id: recipientId,
      type,
      title,
      message,
      channel: "database",
      metadata: JSON.stringify(metadata),
      read_at: readAt,
      created_at: createdAt,
    });
  });
};

const baseDate = new Date(Date.UTC(2026, 0, 5, 8, 0, 0));

for (let index = 0; index < shipmentCount; index += 1) {
  const sequence = index + 1;
  const trackingNumber = `PLT${pad(sequence, 7)}`;
  const originDepartment = departments[index % departments.length];
  const destDepartment = departments[(index * 3 + 4) % departments.length];
  const sender = clients[index % clients.length];
  const receiver = clients[(index * 7 + 11) % clients.length];
  const shipmentType = SHIPMENT_TYPES[index % SHIPMENT_TYPES.length];
  const sizeCategory = SIZE_CATEGORIES[(index * 2) % SIZE_CATEGORIES.length];
  const tariff = tariffByKey.get(
    `${originDepartment.city}|${destDepartment.city}|${shipmentType}|${sizeCategory}`
  );

  const status = chooseStatus(sequence);
  const createdAt = addMinutes(baseDate, index * 73);
  const weightKg = Number((0.2 + ((index * 37) % 240) / 10).toFixed(2));
  const declaredValue = index % 6 === 0 ? money(300 + (index % 40) * 75) : null;
  const insurance = Number(declaredValue || 0) > 500 ? Math.round(Number(declaredValue) * 0.005) : 0;

  const isCourierCandidate = ["ready_for_pickup", "delivered"].includes(status) && index % 4 === 0;
  const terminalFailedCourier = status === "ready_for_pickup" && index % 64 === 0;
  const oneFailedCourier = status === "ready_for_pickup" && index % 20 === 0 && !terminalFailedCourier;
  const failedAttempts = terminalFailedCourier ? 3 : oneFailedCourier ? 1 : 0;
  const isCourier = isCourierCandidate && failedAttempts < 3;

  const courierAddress =
    isCourier || failedAttempts > 0
      ? nextCourierAddressInCity(destDepartment.city)
      : null;

  const totalCost =
    Number(tariff.base_price) +
    Number(tariff.price_per_kg) * weightKg +
    (isCourier
      ? Number(tariff.courier_base_fee) + Number(tariff.courier_fee_per_kg) * weightKg
      : 0) +
    insurance;

  const shipmentId = BASE_IDS.shipments + sequence;
  const route = routeByDepartments.get(`${originDepartment.id}|${destDepartment.id}`) || null;

  const shipment = {
    id: shipmentId,
    tracking_number: trackingNumber,
    sender_id: sender.id,
    receiver_id: receiver.id,
    origin_dept_id: originDepartment.id,
    dest_dept_id: destDepartment.id,
    current_dept_id: currentDepartmentForStatus(status, originDepartment.id, destDepartment.id),
    tariff_id: tariff.id,
    route_id: route ? route.id : null,
    status,
    total_cost: money(totalCost),
    failed_attempts: failedAttempts,
    created_at: formatTimestamp(createdAt),
  };

  shipments.push(shipment);

  shipmentDetails.push({
    shipment_id: shipmentId,
    shipment_type: shipmentType,
    size_category: sizeCategory,
    weight_kg: money(weightKg),
    length_cm: money(15 + (index % 80)),
    width_cm: money(10 + (index % 45)),
    height_cm: money(2 + (index % 35)),
    declared_value: declaredValue,
    description: index % 5 === 0 ? `Тестове відправлення №${sequence}` : null,
    sender_address: addressInCity(originDepartment.city, index),
    receiver_address: isCourier || failedAttempts > 0
      ? courierAddress
      : `${destDepartment.city}, відділення PostLine`,
    is_courier: isCourier,
  });

  STATUS_FLOW[status].forEach((eventStatus, eventIndex) => {
    const eventDepartmentId = departmentForEvent(eventStatus, originDepartment.id, destDepartment.id);

    processingEvents.push({
      id: processingEventId++,
      shipment_id: shipmentId,
      department_id: eventDepartmentId,
      operator_id: operatorForDepartment(eventDepartmentId).id,
      status_set: eventStatus,
      notes: eventNote(eventStatus),
      created_at: formatTimestamp(addMinutes(createdAt, eventIndex * 180)),
    });
  });

  const recipients = notificationRecipients(sender.id, receiver.id);
  const shipmentNotification = shipmentNotificationContent[status];

  if (shipmentNotification) {
    pushNotificationsForRecipients({
      shipmentId,
      recipientIds: recipients,
      type: `shipment_${status}`,
      title: shipmentNotification.title,
      message: shipmentNotification.message(trackingNumber),
      metadata: { trackingNumber, status },
      readAt: index % 4 === 0 ? formatTimestamp(addMinutes(createdAt, 600)) : null,
      createdAt: formatTimestamp(addMinutes(createdAt, STATUS_FLOW[status].length * 180 + 15)),
    });
  }

  if (isCourier || failedAttempts > 0) {
    const courier = courierForDepartment(destDepartment.id);
    const operator = operatorForDepartment(destDepartment.id);
    const deliveryBaseDate = addMinutes(createdAt, STATUS_FLOW[status].length * 180 + 60);

    for (let attempt = 1; attempt <= failedAttempts; attempt += 1) {
      const deliveryId = courierDeliveryId++;

      courierDeliveries.push({
        id: deliveryId,
        shipment_id: shipmentId,
        courier_id: courier.id,
        operator_id: operator.id,
        to_address: courierAddress,
        status: "failed",
        failure_reason: attempt === 1
          ? "Одержувач був відсутній за адресою"
          : "Одержувач не відповів на телефонний дзвінок",
        notes: `Згенерована невдала спроба кур’єрської доставки №${attempt}`,
        attempt_datetime: formatTimestamp(addMinutes(deliveryBaseDate, attempt * 1440)),
      });

      pushNotificationsForRecipients({
        shipmentId,
        recipientIds: recipients,
        type: "courier_delivery_failed",
        title: "Кур'єрська доставка не виконана",
        message: `Спроба кур'єрської доставки №${attempt} для відправлення ${trackingNumber} завершилась невдало.`,
        metadata: { trackingNumber, courierDeliveryId: deliveryId, attempt, status: "failed" },
        createdAt: formatTimestamp(addMinutes(deliveryBaseDate, attempt * 1440 + 10)),
      });
    }

    if (isCourier) {
      const deliveryStatus =
        status === "delivered" ? "delivered" : index % 3 === 0 ? "in_progress" : "assigned";
      const deliveryId = courierDeliveryId++;

      courierDeliveries.push({
        id: deliveryId,
        shipment_id: shipmentId,
        courier_id: courier.id,
        operator_id: operator.id,
        to_address: courierAddress,
        status: deliveryStatus,
        failure_reason: null,
        notes: deliveryStatus === "delivered"
          ? "Згенерована успішна кур’єрська доставка"
          : "Згенерована активна кур’єрська доставка",
        attempt_datetime: formatTimestamp(addMinutes(deliveryBaseDate, 90)),
      });

      pushNotificationsForRecipients({
        shipmentId,
        recipientIds: recipients,
        type: "courier_delivery_assigned",
        title: "Кур'єра призначено",
        message: `Для відправлення ${trackingNumber} призначено кур'єрську доставку.`,
        metadata: { trackingNumber, courierDeliveryId: deliveryId, status: deliveryStatus },
        readAt: index % 6 === 0 ? formatTimestamp(addMinutes(deliveryBaseDate, 120)) : null,
        createdAt: formatTimestamp(addMinutes(deliveryBaseDate, 75)),
      });
    }
  }
}

emit("-- Generated PostLine test data.");
emit("-- Compatible with sql4 schema without persisted courier route tables.");
emit("-- Temporarily disables trigger-generated side effects while loading deterministic history.");
emit("-- Uses real whitelisted addresses per city for stable geocoding.");
emit("-- Courier deliveries stay inside destination city and rotate through city-specific addresses.");
emit("-- Repairs shipment status trigger to write processing_events, not legacy processing_history.");
emit("-- This file was generated by db/generate-test-data.js.");
emit(`-- Shipments: ${shipmentCount}`);
emit(`-- Generated user password: ${DEMO_PASSWORD}`);
emit();
emit("BEGIN;");
emit();

emitShipmentStatusTriggerFunction();
emitTriggerState("public.shipments", "trg_shipment_status", false);
emitTriggerState("public.courier_deliveries", "trg_courier_attempt", false);

emitInsert("public.departments", [
  "id",
  "city",
  "address",
  "type",
  "phone",
  "opening_time",
  "closing_time",
  "deleted_at",
], departments);

emitInsert("public.users", [
  "id",
  "role",
  "department_id",
  "full_name",
  "phone",
  "email",
  "password_hash",
  "created_at",
  "deleted_at",
], users);

emitInsert("public.tariffs", [
  "id",
  "city_from",
  "city_to",
  "shipment_type",
  "size_category",
  "base_price",
  "price_per_kg",
  "deleted_at",
  "courier_base_fee",
  "courier_fee_per_kg",
], tariffs);

emitInsert("public.routes", [
  "id",
  "start_dept_id",
  "end_dept_id",
  "distance_km",
  "est_time_hours",
  "deleted_at",
], routes);

emitInsert("public.route_stops", [
  "route_id",
  "department_id",
  "sequence_order",
  "distance_from_prev_km",
], routeStops);

emitInsert("public.shipments", [
  "id",
  "tracking_number",
  "sender_id",
  "receiver_id",
  "origin_dept_id",
  "dest_dept_id",
  "current_dept_id",
  "tariff_id",
  "route_id",
  "status",
  "total_cost",
  "failed_attempts",
  "created_at",
], shipments);

emitInsert("public.shipment_details", [
  "shipment_id",
  "shipment_type",
  "size_category",
  "weight_kg",
  "length_cm",
  "width_cm",
  "height_cm",
  "declared_value",
  "description",
  "sender_address",
  "receiver_address",
  "is_courier",
], shipmentDetails);

emitInsert("public.processing_events", [
  "id",
  "shipment_id",
  "department_id",
  "operator_id",
  "status_set",
  "notes",
  "created_at",
], processingEvents);

emitInsert("public.courier_deliveries", [
  "id",
  "shipment_id",
  "courier_id",
  "operator_id",
  "to_address",
  "status",
  "failure_reason",
  "notes",
  "attempt_datetime",
], courierDeliveries);

emitInsert("public.notifications", [
  "id",
  "shipment_id",
  "recipient_id",
  "type",
  "title",
  "message",
  "channel",
  "metadata",
  "read_at",
  "created_at",
], notifications);

emitTriggerState("public.courier_deliveries", "trg_courier_attempt", true);
emitTriggerState("public.shipments", "trg_shipment_status", true);

emit("SELECT setval('public.departments_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.departments), 1), true);");
emit("SELECT setval('public.users_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.users), 1), true);");
emit("SELECT setval('public.tariffs_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.tariffs), 1), true);");
emit("SELECT setval('public.routes_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.routes), 1), true);");
emit("SELECT setval('public.shipments_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.shipments), 1), true);");
emit("SELECT setval('public.processing_events_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.processing_events), 1), true);");
emit("SELECT setval('public.courier_deliveries_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.courier_deliveries), 1), true);");
emit("SELECT setval('public.notifications_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.notifications), 1), true);");

emit();
emit("COMMIT;");

fs.writeFileSync(outputPath, `${outputLines.join("\n")}\n`, "utf8");

console.log("SQL-файл з тестовими даними створено.");
console.log(`Шлях: ${outputPath}`);
console.log(`Кількість відправлень: ${shipmentCount}`);
console.log(`Пароль для всіх тестових користувачів: ${DEMO_PASSWORD}`);
