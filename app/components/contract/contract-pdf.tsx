import {
  agencyFooterText,
  blank,
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
    fontSize: 8,
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
  clause: { marginBottom: 8, fontSize: 9, lineHeight: 1.45 },
  clauseTitle: { color: "#235346", marginBottom: 2 },
});

const blue = StyleSheet.create({
  header: { backgroundColor: "#eef4fc", padding: 6, paddingHorizontal: 8 },
  section: { borderColor: "#b9cce6" },
  rows: { padding: 0 },
  cell: {
    padding: 3,
    paddingHorizontal: 5,
    borderBottomWidth: 0.7,
    borderRightWidth: 0.7,
    borderColor: "#d5e2f3",
  },
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
  const isGrid = template.id === "grid";
  const isPanels = template.id === "panels";
  const isSignature = template.id === "signature";
  const isRegister = template.id === "register";
  const paperFont = rtl ? { fontFamily: arabicFont } : {};
  const valueFont = (value: string) =>
    /\p{Script=Arabic}/u.test(value) ? { fontFamily: arabicFont } : {};
  const headerStyle = [
    styles.header,
    { borderBottomColor: a.color },
    isGrid ? blue.header : {},
  ];
  const frontInk = isRegister ? { color: headingInk(a.color) } : {};
  const sectionStyle = [
    styles.section,
    isGrid ? blue.section : {},
    isPanels ? violet.section : {},
    isSignature ? { ...burgundy.section, borderColor: a.color } : {},
  ];
  const signatureStyle = [
    styles.signature,
    isGrid ? blue.section : {},
    isPanels ? violet.section : {},
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
        isGrid ? blue.rows : {},
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
              isGrid ? blue.cell : {},
              rtl && isGrid
                ? { borderRightWidth: 0, borderLeftWidth: 0.7 }
                : {},
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
                styles.clauseTitle,
                { color: a.color },
                direction === "rtl" ? { fontWeight: 700 } : {},
              ]}
              minPresenceAhead={12}
            >
              {title}
            </Text>
            {body.length > 0 && <Text style={align}>{body.join("\n")}</Text>}
          </View>
        );
      });
  };
  return pdf(
    <Document title={a.title} creator="Louma" language={a.locale}>
      <Page size="A4" style={[styles.page, paperFont]}>
        <View
          style={[
            ...headerStyle,
            isRegister ? { ...slate.header, backgroundColor: a.color } : {},
          ]}
        >
          <View
            style={[
              styles.brand,
              { flexDirection: rtl ? "row-reverse" : "row" },
              isSignature ? burgundy.centerBrand : {},
            ]}
          >
            {a.logo && (
              // React-PDF Image does not support the HTML alt property.
              // eslint-disable-next-line jsx-a11y/alt-text
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
            <View style={styles.inspection}>
              {notes(conditionNoteGroups[0])}
              {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image has no alt property. */}
              <Image
                src={new URL(conditionDiagram, window.location.origin).href}
                style={styles.diagram}
              />
              {notes(conditionNoteGroups[1])}
            </View>
          </View>
          {rows("amounts")}
          <Text style={alignment}>
            {a.labels.place ?? t("Fait à / le", "حرر في / بتاريخ")} :{" "}
            {a.place || blank}
          </Text>
          <View
            style={[
              styles.signatures,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <Text style={[...signatureStyle, alignment]}>
              {a.labels.stamp ??
                t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
            </Text>
            <Text style={[...signatureStyle, alignment]}>
              {a.labels.signature ??
                t("Signature du locataire", "توقيع المستأجر")}
            </Text>
          </View>
        </View>
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
