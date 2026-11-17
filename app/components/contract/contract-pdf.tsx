import {
  agencyFooterText,
  blank,
  blueContractFields,
  blueDocumentChecklist,
  conditionDiagram,
  conditionNoteGroups,
  contractFields,
  fieldId,
  fieldValue,
  headingInk,
  words,
  type Agreement,
  type BlockId,
} from "@/lib/contract/agreement";
import { templateForColor } from "@/lib/contract/templates";
import {
  Document,
  Font,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const font = "Louma Sans";
const arabicFont = ["Tajawal", font];
const styles = StyleSheet.create({
  page: {
    padding: 37,
    paddingBottom: 118,
    color: "#152821",
    fontFamily: font,
    fontSize: 9,
    lineHeight: 1.35,
  },
  title: { fontSize: 19, marginTop: 13, marginBottom: 12 },
  logo: { width: 75, height: 33, objectFit: "contain" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  agency: { flex: 1, fontSize: 14 },
  front: { gap: 8, marginBottom: 9 },
  sectionRow: { flexDirection: "row", alignItems: "stretch", gap: 8 },
  column: { flexBasis: 0, minWidth: 0, gap: 8 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 37,
    right: 37,
    borderTopWidth: 1,
    paddingTop: 6,
    fontSize: 7,
  },
  header: { borderBottomWidth: 2, marginBottom: 10 },
  pair: { flexDirection: "row", gap: 9, marginBottom: 9 },
  section: { minWidth: 0, borderWidth: 1, borderColor: "#dae4de" },
  heading: { fontSize: 10, padding: 4, paddingHorizontal: 8, color: "#fff" },
  rows: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    paddingHorizontal: 8,
  },
  row: { width: "50%", paddingBottom: 4, paddingHorizontal: 3 },
  amounts: { marginTop: 5, marginBottom: 7 },
  inspection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 6,
    paddingHorizontal: 9,
  },
  diagram: { width: 58, height: 82 },
  notes: { flex: 1, gap: 3 },
  note: { minHeight: 14, borderBottomWidth: 0.7, borderBottomColor: "#a5b7aa" },
  dottedLine: {
    height: 12.15,
    borderBottomWidth: 0.7,
    borderBottomStyle: "dotted",
    borderBottomColor: "#687b72",
  },
  label: { color: "#4c5e55", fontSize: 8 },
  signatures: { flexDirection: "row", gap: 9, marginTop: 8 },
  signature: {
    width: "50%",
    minHeight: 125,
    padding: 8,
    borderWidth: 1,
    borderColor: "#dae4de",
  },
  termsColumn: { flex: 1, minWidth: 0 },
  clause: { marginBottom: 5 },
  clauseText: { fontSize: 8, lineHeight: 1.3 },
  clauseTitle: { color: "#235346", marginBottom: 2 },
});

const blue = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    flexGrow: 5,
    flexBasis: 0,
    fontSize: 15,
    padding: 9,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    textAlign: "center",
  },
  brandColumn: { flexGrow: 4, flexBasis: 0, gap: 4 },
  section: { borderWidth: 0.75, borderRadius: 9, padding: 4, gap: 2 },
  heading: {
    alignSelf: "center",
    borderWidth: 0.75,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 1,
    marginBottom: 2,
    textAlign: "center",
  },
  rows: { gap: 2 },
  row: { alignItems: "stretch", gap: 4, fontSize: 7.75 },
  caption: {
    flexBasis: 0,
    flexGrow: 46,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  value: {
    flexBasis: 0,
    flexGrow: 54,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pill: { borderRadius: 7, borderWidth: 0.65 },
  line: { borderBottomWidth: 0.65, borderBottomStyle: "dotted" },
  conditionDiagram: { width: 40, height: 57 },
  signature: { borderRadius: 9, minHeight: 87, textAlign: "center" },
  checklist: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 10,
  },
  checklistItem: { alignItems: "center", gap: 3, fontSize: 8 },
  checkbox: { width: 7, height: 7, borderWidth: 0.7, borderRadius: 4 },
});
const violet = StyleSheet.create({
  section: { borderColor: "#dcd1e9", borderRadius: 7 },
  heading: { margin: 3, borderRadius: 5, backgroundColor: "#efe8f6" },
  amounts: { backgroundColor: "#efe8f6", borderRadius: 6 },
});
const burgundy = StyleSheet.create({
  section: { borderWidth: 0, borderTopWidth: 1 },
  heading: {
    backgroundColor: "#fff",
    borderBottomWidth: 0.7,
    borderBottomColor: "#e4c9cd",
  },
  amounts: {
    borderTopWidth: 0.7,
    borderBottomWidth: 0.7,
    borderColor: "#e4c9cd",
  },
  centerBrand: { justifyContent: "center" },
  centerAgency: { fontSize: 14, flexShrink: 1, textAlign: "center" },
});
const slate = StyleSheet.create({
  header: { padding: 8, paddingHorizontal: 10 },
  heading: { backgroundColor: "#edf0f3" },
  amounts: { backgroundColor: "#edf0f3" },
  signature: { minHeight: 100 },
});

let registered = false;
export async function buildContractPdf(a: Agreement) {
  if (!registered) {
    Font.register({
      family: font,
      src: new URL("/fonts/DejaVuSans.ttf", window.location.origin).href,
    });
    Font.register({
      family: "Tajawal",
      fonts: [
        {
          src: new URL("/fonts/Tajawal-Regular.ttf", window.location.origin)
            .href,
          fontWeight: 400,
        },
        {
          src: new URL("/fonts/Tajawal-Bold.ttf", window.location.origin).href,
          fontWeight: 700,
        },
      ],
    });
    Font.registerHyphenationCallback((word) => [word]);
    registered = true;
  }
  const rtl = a.locale === "ar";
  const t = words(a.locale);
  const alignment = {
    textAlign: rtl ? ("right" as const) : ("left" as const),
    direction: rtl ? ("rtl" as const) : ("ltr" as const),
  };
  const fields = contractFields(a.locale);
  const template = templateForColor(a.color);
  const isBlue = template.id === "blue";
  const isBanded = template.id === "banded";
  const isTabular = template.id === "tabular";
  const blueFields = blueContractFields(a.locale);
  const isPanels = template.id === "panels";
  const isSignature = template.id === "signature";
  const isRegister = template.id === "register";
  const paperFont = rtl ? { fontFamily: arabicFont } : {};
  const valueFont = (value: string) =>
    /\p{Script=Arabic}/u.test(value) ? { fontFamily: arabicFont } : {};
  const headerStyle = [styles.header, { borderBottomColor: a.color }];
  const frontInk = isRegister ? { color: headingInk(a.color) } : {};
  const sectionStyle = [
    styles.section,
    isPanels ? violet.section : {},
    isSignature ? { ...burgundy.section, borderColor: a.color } : {},
  ];
  const signatureStyle = [
    styles.signature,
    isTabular ? { borderTopWidth: 5, borderTopColor: a.color } : {},
    isPanels ? violet.section : {},
    isBlue ? { ...blue.signature, borderColor: a.color } : {},
    isSignature ? { ...burgundy.section, borderColor: a.color } : {},
    isRegister ? slate.signature : {},
  ];
  const amountsStyle = [
    styles.amounts,
    isPanels ? violet.amounts : {},
    isSignature ? burgundy.amounts : {},
    isRegister ? slate.amounts : {},
  ];
  const rows = (id: keyof typeof fields) => (
    <View
      style={[
        styles.rows,
        { flexDirection: rtl ? "row-reverse" : "row" },
        ...(id === "amounts" ? amountsStyle : []),
      ]}
    >
      {fields[id].map(({ key, label, type, fullWidth, lines = 1 }) => {
        const wide = id !== "amounts" && template.wideFields?.includes(id);
        const keyId = fieldId(key);
        const raw = fieldValue(a, key).trim();
        const value =
          type === "date" && raw ? raw.split("-").reverse().join("/") : raw;
        const leftToRight = rtl && value && !/\p{Script=Arabic}/u.test(value);
        return (
          <View
            key={keyId}
            style={[
              styles.row,
              fullWidth
                ? { width: wide ? "50%" : "100%" }
                : wide
                  ? { width: "25%" }
                  : {},
            ]}
          >
            <Text style={[styles.label, alignment]}>
              {a.labels[keyId] ?? label}
            </Text>
            {!value && lines > 1 ? (
              <View>
                {Array.from({ length: lines }, (_, index) => (
                  <View key={index} style={styles.dottedLine} />
                ))}
              </View>
            ) : (
              <Text
                style={[
                  alignment,
                  valueFont(value),
                  lines > 1 ? { minHeight: lines * 9 * 1.35 } : {},
                  { direction: leftToRight ? "ltr" : alignment.direction },
                ]}
              >
                {value ? (leftToRight ? "\u200e" + value : value) : blank}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
  const heading = (id: BlockId) => (
    <Text
      style={[
        styles.heading,
        alignment,
        { backgroundColor: a.color, color: headingInk(a.color) },
        isPanels ? violet.heading : {},
        isSignature ? burgundy.heading : {},
        isRegister ? slate.heading : {},
        isPanels || isSignature || isRegister ? { color: a.color } : {},
        isTabular ? { textAlign: "center" } : {},
        rtl ? { fontWeight: 700 } : {},
      ]}
    >
      {a.headings[id]}
    </Text>
  );
  const block = (id: Exclude<BlockId, "condition">, stretch = false) => (
    <View
      key={id}
      style={[...sectionStyle, stretch ? { flexGrow: 1 } : {}]}
      wrap={false}
    >
      {heading(id)}
      {rows(id)}
    </View>
  );
  const notes = (group: readonly number[]) => (
    <View style={styles.notes}>
      {group.map((index) => (
        <Text
          key={index}
          style={[styles.note, alignment, valueFont(a.conditionNotes[index])]}
        >
          {a.conditionNotes[index] || " "}
        </Text>
      ))}
    </View>
  );
  const footerText = agencyFooterText(a);
  const footer = () => (
    <View style={[styles.footer, { borderTopColor: a.color }]} fixed>
      <Text style={[alignment, valueFont(footerText), { textAlign: "center" }]}>
        {footerText}
      </Text>
    </View>
  );
  const clauses = (value: string, direction: "ltr" | "rtl") => {
    const align = {
      direction,
      textAlign: direction === "rtl" ? ("right" as const) : ("left" as const),
      fontFamily: direction === "rtl" ? arabicFont : font,
    };
    return (value.trim() || "……………………")
      .split(/\n\s*\n/)
      .map((clause, index) => {
        const [title, ...body] = clause.split("\n");
        return (
          <View key={index} style={styles.clause}>
            <Text
              style={[
                align,
                styles.clauseText,
                styles.clauseTitle,
                { color: a.color },
                direction === "rtl" ? { fontWeight: 700 } : {},
              ]}
              minPresenceAhead={12}
            >
              {title}
            </Text>
            {body.length > 0 && (
              <Text style={[align, styles.clauseText]}>{body.join("\n")}</Text>
            )}
          </View>
        );
      });
  };
  const blueRows = (items: typeof blueFields.renter, pills = false) => (
    <View style={blue.rows}>
      {items.map(({ key, label, type, lines }) => {
        const id = fieldId(key);
        const raw = fieldValue(a, key).trim();
        const value =
          type === "date" && raw ? raw.split("-").reverse().join("/") : raw;
        const ltr = rtl && value && !/\p{Script=Arabic}/u.test(value);
        return (
          <View
            key={id}
            wrap={false}
            style={[blue.row, { flexDirection: rtl ? "row-reverse" : "row" }]}
          >
            <Text
              style={[
                alignment,
                blue.caption,
                pills
                  ? {
                      ...blue.pill,
                      backgroundColor: a.color,
                      borderColor: a.color,
                      color: headingInk(a.color),
                    }
                  : {},
              ]}
            >
              {a.labels[id] ?? label}
            </Text>
            <Text
              style={[
                alignment,
                valueFont(value),
                blue.value,
                pills ? blue.pill : blue.line,
                { borderColor: a.color, minHeight: lines === 2 ? 22 : 0 },
                ltr ? { direction: "ltr" } : {},
              ]}
            >
              {value ? (ltr ? "\u200e" + value : value) : " "}
            </Text>
          </View>
        );
      })}
    </View>
  );
  const blueHeading = (title: string, filled = false) => (
    <Text
      style={[
        alignment,
        valueFont(title),
        blue.heading,
        { borderColor: a.color },
        filled ? { backgroundColor: a.color, color: headingInk(a.color) } : {},
      ]}
    >
      {title}
    </Text>
  );
  const blueSection = (id: "renter" | "vehicle" | "rental" | "driver") => (
    <View key={id} style={[blue.section, { borderColor: a.color }]}>
      {blueHeading(
        id === "driver" ? t("Autre conducteur", "سائق إضافي") : a.headings[id],
        id === "vehicle" || id === "rental",
      )}
      {blueRows(blueFields[id], id === "vehicle" || id === "rental")}
    </View>
  );
  const place = (
    <Text style={alignment}>
      {a.labels.place ?? t("Fait à / le", "حرر في / بتاريخ")} :{" "}
      {a.place || blank}
    </Text>
  );
  const inspection = (
    <View style={styles.inspection}>
      {notes(conditionNoteGroups[0])}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image has no alt property. */}
      <Image
        src={new URL(conditionDiagram, window.location.origin).href}
        style={isBlue ? blue.conditionDiagram : styles.diagram}
      />
      {notes(conditionNoteGroups[1])}
    </View>
  );
  const direction = {
    flexDirection: rtl ? ("row-reverse" as const) : ("row" as const),
  };
  const brand = (
    <View
      style={[styles.brand, direction, isSignature ? burgundy.centerBrand : {}]}
    >
      {a.logo && (
        // eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image has no alt property.
        <Image src={a.logo} style={styles.logo} />
      )}
      {a.agency && (
        <Text
          style={[
            alignment,
            isSignature ? burgundy.centerAgency : styles.agency,
            valueFont(a.agency),
            frontInk,
          ]}
        >
          {a.agency}
        </Text>
      )}
    </View>
  );
  const signatures = (
    <View style={[styles.signatures, direction]} wrap={false}>
      <Text style={[alignment, ...signatureStyle]}>
        {a.labels.stamp ??
          t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
      </Text>
      <Text style={[alignment, ...signatureStyle]}>
        {a.labels.signature ?? t("Signature du locataire", "توقيع المستأجر")}
      </Text>
    </View>
  );
  return pdf(
    <Document title={a.title} creator="Louma" language={a.locale}>
      <Page
        size="A4"
        style={[styles.page, paperFont, isBlue ? { color: a.color } : {}]}
      >
        {isBlue ? (
          <>
            <View
              style={[
                blue.header,
                { flexDirection: rtl ? "row-reverse" : "row" },
              ]}
              wrap={false}
            >
              <Text
                style={[
                  alignment,
                  valueFont(a.title),
                  blue.title,
                  { backgroundColor: a.color, color: headingInk(a.color) },
                ]}
              >
                {a.title.toLocaleUpperCase(a.locale)}
              </Text>
              <View style={blue.brandColumn}>
                {brand}
                {blueRows([blueFields.reference], true)}
              </View>
            </View>
            <View style={styles.sectionRow}>
              {template.rows[0].map(({ blocks, weight }) => (
                <View
                  key={blocks[0]}
                  style={[styles.column, { flexGrow: weight }]}
                >
                  {blocks.map(blueSection)}
                  {blocks[0] === "renter" ? (
                    <>
                      {blueSection("driver")}
                      <View
                        style={[blue.section, { borderColor: a.color }]}
                        wrap={false}
                      >
                        {place}
                      </View>
                    </>
                  ) : (
                    <>
                      {blueRows(blueFields.amounts, true)}
                      <View
                        style={[blue.section, { borderColor: a.color }]}
                        wrap={false}
                      >
                        {blueHeading(a.headings.condition, true)}
                        {inspection}
                        {blueRows(blueFields.inspection)}
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View
              style={[
                ...headerStyle,
                isBanded
                  ? { borderTopWidth: 9, borderTopColor: a.color, paddingTop: 8 }
                  : {},
                isRegister ? { ...slate.header, backgroundColor: a.color } : {},
              ]}
            >
              {brand}
              <Text
                style={[
                  styles.title,
                  alignment,
                  valueFont(a.title),
                  frontInk,
                  rtl ? { fontWeight: 700 } : {},
                  isSignature ? { textAlign: "center" } : {},
                ]}
              >
                {a.title}
              </Text>
            </View>
            <View style={styles.front} wrap={false}>
              {template.rows.map((row) => (
                <View style={styles.sectionRow} key={row[0].blocks[0]}>
                  {row.map(({ blocks, weight }) => (
                    <View
                      style={[styles.column, { flexGrow: weight }]}
                      key={blocks[0]}
                    >
                      {blocks.map((id) =>
                        block(id, row.length > 1 && blocks.length === 1),
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <View wrap={false}>
              <View style={sectionStyle}>
                {heading("condition")}
                {inspection}
              </View>
              {rows("amounts")}
              {place}
              {signatures}
            </View>
          </>
        )}
        {isBlue && (
          <View wrap={false}>
            {signatures}
            <View style={[blue.checklist, direction]}>
              {blueDocumentChecklist(a.locale).map(({ key, label }) => (
                <View key={key} style={[blue.checklistItem, direction]}>
                  <View
                    style={[
                      blue.checkbox,
                      { borderColor: a.color },
                      a.blueFields?.[key] === "1"
                        ? { backgroundColor: a.color }
                        : {},
                    ]}
                  />
                  <Text style={alignment}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {footer()}
      </Page>
      <Page size="A4" style={styles.page}>
        <View
          style={[
            ...headerStyle,
            isRegister ? { ...slate.header, backgroundColor: a.color } : {},
          ]}
        >
          <View style={styles.pair}>
            <Text style={[styles.title, styles.termsColumn, frontInk]}>
              {a.termsTitles.fr}
            </Text>
            <Text
              style={[
                styles.title,
                styles.termsColumn,
                {
                  textAlign: "right",
                  direction: "rtl",
                  fontFamily: arabicFont,
                  fontWeight: 700,
                },
                frontInk,
              ]}
            >
              {a.termsTitles.ar}
            </Text>
          </View>
        </View>
        <View style={styles.pair}>
          <View style={styles.termsColumn}>{clauses(a.termsFr, "ltr")}</View>
          <View style={styles.termsColumn}>{clauses(a.termsAr, "rtl")}</View>
        </View>
        {footer()}
      </Page>
    </Document>,
  ).toBlob();
}

export function buildPhotoPdf(src: string, width: number, height: number) {
  const scale = Math.min(521 / width, 767 / height);
  return pdf(
    <Document>
      <Page
        size="A4"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image has no alt property. */}
        <Image
          src={src}
          style={{ width: width * scale, height: height * scale }}
        />
      </Page>
    </Document>,
  ).toBlob();
}
