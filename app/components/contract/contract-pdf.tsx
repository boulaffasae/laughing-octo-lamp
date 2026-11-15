import {
  blockRows,
  headingInk,
  frontPageOrder,
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
    color: "#152821",
    fontFamily: font,
    fontSize: 9,
    lineHeight: 1.35,
  },
  title: { fontSize: 19, marginTop: 13, marginBottom: 12 },
  logo: { width: 75, height: 33, objectFit: "contain" },
  header: { borderBottomWidth: 2, marginBottom: 10 },
  pair: { flexDirection: "row", gap: 9, marginBottom: 9 },
  section: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: "#dae4de" },
  heading: { fontSize: 10, padding: 4, paddingHorizontal: 8, color: "#fff" },
  rows: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    paddingHorizontal: 8,
  },
  row: { width: "50%", paddingBottom: 4, paddingHorizontal: 3 },
  label: { color: "#4c5e55", fontSize: 8 },
  signatures: { flexDirection: "row", gap: 9, marginTop: 8 },
  signature: {
    width: "50%",
    height: 59,
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
  const block = (id: BlockId) => (
    <View key={id} style={styles.section} wrap={false}>
      <Text
        style={[
          styles.heading,
          alignment,
          { backgroundColor: a.color, color: headingInk(a.color) },
        ]}
      >
        {a.headings[id]}
      </Text>
      <View
        style={[styles.rows, { flexDirection: rtl ? "row-reverse" : "row" }]}
      >
        {blockRows(a, id).map(([label, value]) => {
          const leftToRight = rtl && value && !/\p{Script=Arabic}/u.test(value);
          return (
            <View key={label} style={styles.row}>
              <Text style={[styles.label, alignment]}>{label}</Text>
              <Text
                style={[
                  alignment,
                  { direction: leftToRight ? "ltr" : alignment.direction },
                ]}
              >
                {value ? (leftToRight ? "\u200e" + value : value) : "……………………"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
  const order = frontPageOrder(a);
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
            <Text style={[align, styles.clauseTitle]} minPresenceAhead={12}>
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
          <View style={{ alignSelf: rtl ? "flex-end" : "flex-start" }}>
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
          </View>
          <Text style={[styles.title, alignment]}>{a.title}</Text>
        </View>
        {[order.slice(0, 2), order.slice(2)].map((pair, index) => (
          <View
            key={index}
            style={[
              styles.pair,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
            wrap={false}
          >
            {pair.map(block)}
          </View>
        ))}
        <View wrap={false}>
          <Text style={alignment}>
            {t("Fait à / le", "حرر في / بتاريخ")} : {a.place || "……………………"}
          </Text>
          <View
            style={[
              styles.signatures,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <Text style={[styles.signature, alignment]}>
              {t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
            </Text>
            <Text style={[styles.signature, alignment]}>
              {t("Signature du locataire", "توقيع المستأجر")}
            </Text>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: a.color }]}>
          <View style={styles.pair}>
            <Text style={[styles.title, styles.termsColumn]}>
              {rtl ? "Conditions de location" : a.headings.terms}
            </Text>
            <Text
              style={[
                styles.title,
                styles.termsColumn,
                { textAlign: "right", direction: "rtl" },
              ]}
            >
              {rtl ? a.headings.terms : "شروط الكراء"}
            </Text>
          </View>
        </View>
        <View style={styles.pair}>
          <View style={styles.termsColumn}>{clauses(a.termsFr, "ltr")}</View>
          <View style={styles.termsColumn}>{clauses(a.termsAr, "rtl")}</View>
        </View>
      </Page>
    </Document>,
  ).toBlob();
}
