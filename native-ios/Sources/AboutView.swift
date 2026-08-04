import SwiftUI

/// Écran « À propos » : crédits, version et provenance des données.
struct AboutView: View {
    let lang: Lang
    @Environment(\.dismiss) private var dismiss

    private var version: String {
        let info = Bundle.main.infoDictionary
        let short = info?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let build = info?["CFBundleVersion"] as? String ?? "1"
        return "\(short) (\(build))"
    }

    private var year: Int { Calendar.current.component(.year, from: Date()) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    // En-tête : logo Lipton + nom de l'app.
                    VStack(spacing: 10) {
                        Text("Lipton")
                            .font(.system(size: 26, weight: .heavy))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16).padding(.vertical, 6)
                            .background(Color(hex: "#e20025"))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        Text(Loc.title(lang))
                            .font(.title2).fontWeight(.heavy)
                        Text(Loc.aboutVersion(lang) + " " + version)
                            .font(.footnote).foregroundColor(.secondary)
                    }
                    .padding(.top, 12)

                    // Crédits.
                    card {
                        VStack(spacing: 6) {
                            Text(Loc.aboutCreditsTitle(lang).uppercased())
                                .font(.caption).fontWeight(.semibold).foregroundColor(.secondary)
                            Text(Loc.aboutBy(lang))
                                .font(.body).foregroundColor(.secondary)
                            Text("Maxime Nathan Lestage")
                                .font(.title3).fontWeight(.bold)
                                .multilineTextAlignment(.center)
                            Text("@maxlestage")
                                .font(.subheadline).foregroundColor(.secondary)
                            Text("© \(year)")
                                .font(.footnote).foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // Contenu de l'app.
                    card {
                        VStack(spacing: 6) {
                            Text(Loc.aboutDataTitle(lang).uppercased())
                                .font(.caption).fontWeight(.semibold).foregroundColor(.secondary)
                            Text(Loc.aboutData(lang, count: DataStore.teas.count))
                                .font(.subheadline)
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    Text(Loc.aboutDisclaimer(lang))
                        .font(.caption2).foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)

                    Spacer(minLength: 12)
                }
                .padding(20)
            }
            .navigationTitle(Loc.aboutTitle(lang))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(Loc.close(lang)) { dismiss() }
                }
            }
        }
    }

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        content()
            .padding(16)
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
