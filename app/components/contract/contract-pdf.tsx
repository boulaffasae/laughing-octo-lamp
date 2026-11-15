import { blockRows, words, type Agreement } from "@/lib/contract/agreement";
import {
  Document,
  Font,
  Image as PdfImage,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const font = "Louma Sans";
const styles = StyleSheet.create({
  page: {
    padding: 34,
    color: "#14213c",
    fontFamily: font,
    fontSize: 9,
    lineHeight: 1.45,
  },
  heading: { fontSize: 21, color: "#14213c", marginBottom: 12 },
  logo: { width: 115, height: 58, objectFit: "contain", marginBottom: 12 },
  rule: {
    borderBottomWidth: 2,
    borderBottomColor: "#2157f3",
    marginBottom: 15,
  },
  columns: { flexDirection: "row", gap: 12 },
  column: { width: "50%" },
  block: {
    borderWidth: 1,
    borderColor: "#dae2ef",
    borderRadius: 7,
    padding: 9,
    marginBottom: 9,
  },
  blockTitle: { color: "#2157f3", fontSize: 11, marginBottom: 5 },
  label: { fontSize: 8, color: "#52627c", marginTop: 3 },
  signature: {
    borderWidth: 1,
    borderColor: "#dae2ef",
    width: "50%",
    height: 65,
    padding: 9,
    borderRadius: 7,
  },
});

let registered = false;
export async function buildContractPdf(agreement: Agreement) {
  if (!registered) {
    Font.register({
      family: font,
      src: new URL("/fonts/DejaVuSans.ttf", window.location.origin).href,
    });
    // Keep document identifiers and Arabic words intact when wrapping lines.
    Font.registerHyphenationCallback((word) => [word]);
    registered = true;
  }
  const rtl = agreement.locale === "ar";
  const t = words(agreement.locale);
  const alignment = {
    textAlign: rtl ? ("right" as const) : ("left" as const),
    direction: rtl ? ("rtl" as const) : ("ltr" as const),
  };
  return pdf(
    <Document
      title={t("Contrat de location", "عقد كراء السيارة")}
      creator="Louma"
      language={agreement.locale}
    >
      <Page size="A4" style={styles.page}>
        {agreement.logo && (
          <PdfImage
            src={agreement.logo}
            style={[
              styles.logo,
              { alignSelf: rtl ? "flex-end" : "flex-start" },
            ]}
          />
        )}
        <Text style={[styles.heading, alignment]}>{agreement.title}</Text>
        <View style={styles.rule} />
        <View
          style={[
            styles.columns,
            { flexDirection: rtl ? "row-reverse" : "row" },
          ]}
        >
          {agreement.columns.map((column, index) => (
            <View key={index} style={styles.column}>
              {column.map((id) => (
                <View key={id} style={styles.block}>
                  <Text style={[styles.blockTitle, alignment]}>
                    {agreement.headings[id]}
                  </Text>
                  {id === "terms" ? (
                    <Text style={alignment}>{agreement.terms}</Text>
                  ) : (
                    blockRows(agreement, id)
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <View key={label} wrap={false}>
                          <Text style={[styles.label, alignment]}>{label}</Text>
                          <Text style={alignment}>{value}</Text>
                        </View>
                      ))
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
        <View
          wrap={false}
          style={[
            styles.columns,
            { flexDirection: rtl ? "row-reverse" : "row", marginTop: 10 },
          ]}
        >
          <View style={styles.signature}>
            <Text style={alignment}>
              {t("Signature de l’agence", "توقيع الوكالة")}
            </Text>
          </View>
          <View style={styles.signature}>
            <Text style={alignment}>
              {t("Signature du locataire", "توقيع المستأجر")}
            </Text>
          </View>
        </View>
      </Page>
    </Document>,
  ).toBlob();
}
