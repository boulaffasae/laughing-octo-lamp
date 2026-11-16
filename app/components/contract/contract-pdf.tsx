import {
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
import {
  Document,
  Font,
  Image,
  Page,
  Path,
  Svg,
  Rect,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const font = "Louma Sans";
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
  front: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 9,
    alignItems: "stretch",
  },
  column: { flex: 1, minWidth: 0, gap: 9 },
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

let registered = false;
export async function buildContractPdf(a: Agreement) {
  if (!registered) {
    Font.register({
      family: font,
      src: new URL("/fonts/DejaVuSans.ttf", window.location.origin).href,
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
  const rows = (id: keyof typeof fields) => (
    <View
      style={[
        styles.rows,
        { flexDirection: rtl ? "row-reverse" : "row" },
        ...(id === "amounts" ? [styles.amounts] : []),
      ]}
    >
      {fields[id].map(({ key, label, type, fullWidth }) => {
        const id = fieldId(key);
        const raw = fieldValue(a, key).trim();
        const value =
          type === "date" && raw ? raw.split("-").reverse().join("/") : raw;
        const leftToRight = rtl && value && !/\p{Script=Arabic}/u.test(value);
        return (
          <View
            key={id}
            style={fullWidth ? [styles.row, { width: "100%" }] : styles.row}
          >
            <Text style={[styles.label, alignment]}>
              {a.labels[id] ?? label}
            </Text>
            <Text
              style={[
                alignment,
                { direction: leftToRight ? "ltr" : alignment.direction },
              ]}
            >
              {value ? (leftToRight ? "\u200e" + value : value) : blank}
            </Text>
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
      ]}
    >
      {a.headings[id]}
    </Text>
  );
  const block = (id: Exclude<BlockId, "condition">, stretch = false) => (
    <View style={[styles.section, stretch ? { flex: 1 } : {}]} wrap={false}>
      {heading(id)}
      {rows(id)}
    </View>
  );
  const notes = (group: readonly number[]) => (
    <View style={styles.notes}>
      {group.map((index) => (
        <Text key={index} style={[styles.note, alignment]}>
          {a.conditionNotes[index] || " "}
        </Text>
      ))}
    </View>
  );
  const footer = () => (
    <View style={[styles.footer, { borderTopColor: a.color }]} fixed>
      <Text style={alignment}>{a.footerText}</Text>
    </View>
  );
  const clauses = (value: string, direction: "ltr" | "rtl") => {
    const align = {
      direction,
      textAlign: direction === "rtl" ? ("right" as const) : ("left" as const),
    };
    return (value.trim() || "……………………")
      .split(/\n\s*\n/)
      .map((clause, index) => {
        const [title, ...body] = clause.split("\n");
        return (
          <View key={index} style={styles.clause}>
            <Text
              style={[align, styles.clauseTitle, { color: a.color }]}
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
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: a.color }]}>
          <View
            style={[
              styles.brand,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            {a.logo ? (
              // React-PDF Image does not support the HTML alt property.
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={a.logo} style={styles.logo} />
            ) : (
              <Svg width={31} height={31} viewBox="0 0 48 48">
                <Rect width={48} height={48} rx={14} fill="#caff74" />
                <Path
                  d="M13 11h8v19h14l-5 7H13z M27 16l5-5h5v5l-5 5h-5z"
                  fill="#152821"
                />
              </Svg>
            )}
            {a.agency && (
              <Text style={[styles.agency, alignment]}>{a.agency}</Text>
            )}
          </View>
          <Text style={[styles.title, alignment]}>{a.title}</Text>
        </View>
        <View style={styles.front} wrap={false}>
          {block("renter", true)}
          <View style={styles.column}>
            {block("vehicle")}
            {block("rental")}
          </View>
        </View>
        <View wrap={false}>
          <View style={styles.section}>
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
            <Text style={[styles.signature, alignment]}>
              {a.labels.stamp ??
                t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
            </Text>
            <Text style={[styles.signature, alignment]}>
              {a.labels.signature ??
                t("Signature du locataire", "توقيع المستأجر")}
            </Text>
          </View>
        </View>
        {footer()}
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: a.color }]}>
          <View style={styles.pair}>
            <Text style={[styles.title, styles.termsColumn]}>
              {a.termsTitles.fr}
            </Text>
            <Text
              style={[
                styles.title,
                styles.termsColumn,
                { textAlign: "right", direction: "rtl" },
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
