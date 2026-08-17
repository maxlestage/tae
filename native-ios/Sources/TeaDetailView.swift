import SwiftUI

/// Fiche produit détaillée, présentée en feuille (sheet).
struct TeaDetailView: View {
    let tea: Tea
    let lang: Lang
    @Environment(\.dismiss) private var dismiss

    private var ink: Color { Color(hex: tea.ink) }

    var body: some View {
        ZStack(alignment: .topTrailing) {
            // Fond plein écran : la texture est en overlay du dégradé, donc
            // elle ne peut pas élargir la mise en page (cf. TextureOverlay).
            Palette.gradient(tea)
                .overlay(TextureOverlay(opacity: 0.12))
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    SachetBadge(ink: ink).padding(.top, 24)

                    Text(Loc.typeName(tea.typeKey, lang).uppercased())
                        .font(.caption).fontWeight(.bold).foregroundColor(ink.opacity(0.85))
                    Text(tea.name[lang])
                        .font(.largeTitle).fontWeight(.heavy).foregroundColor(ink)
                        .multilineTextAlignment(.center)

                    Text(tea.desc[lang])
                        .font(.body).foregroundColor(ink.opacity(0.95))
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)

                    factsGrid

                    if tea.intensity > 0 && !tea.isCoffret {
                        VStack(spacing: 6) {
                            Text(Loc.intensityLabel(lang).uppercased())
                                .font(.caption).fontWeight(.semibold).foregroundColor(ink.opacity(0.8))
                            IntensityDots(value: tea.intensity, ink: ink)
                        }
                        .padding(.vertical, 4)
                    }

                    BrewTimerView(tea: tea, lang: lang, ink: ink)

                    if let ing = tea.ingredients {
                        VStack(spacing: 4) {
                            Text(Loc.ingredientsLabel(lang).uppercased())
                                .font(.caption).fontWeight(.semibold).foregroundColor(ink.opacity(0.8))
                            Text(ing[lang]).font(.subheadline).foregroundColor(ink)
                                .multilineTextAlignment(.center)
                        }
                    }

                    Text(Loc.certification(lang))
                        .font(.footnote).fontWeight(.semibold).foregroundColor(ink.opacity(0.9))

                    palette

                    Spacer(minLength: 24)
                }
                .padding(.horizontal, 22)
                .frame(maxWidth: .infinity)
            }

            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(hex: "#1b1f27"))
                    .frame(width: 40, height: 40)
                    .background(Color.white)
                    .clipShape(Circle())
                    .shadow(color: .black.opacity(0.2), radius: 6, y: 3)
            }
            .padding(20)
        }
    }

    private var factsGrid: some View {
        let cols = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]
        return LazyVGrid(columns: cols, spacing: 10) {
            fact(Loc.typeLabel(lang), Loc.typeName(tea.typeKey, lang))
            fact(Loc.colourLabel(lang), Loc.familyLabel(tea.family, lang))
            fact(Loc.caffeineLabel(lang),
                 tea.isCoffret ? Loc.varied(lang) : (tea.caffeineFree ? Loc.caffeineFree(lang) : Loc.caffeinated(lang)))
            fact(Loc.formatLabel(lang), Loc.fmt(tea, lang))
            if let brew = brewInfo(for: tea, lang) {
                fact(Loc.brewLabel(lang), brew)
            }
        }
    }

    private func fact(_ label: String, _ value: String) -> some View {
        VStack(spacing: 3) {
            Text(label.uppercased())
                .font(.caption2).fontWeight(.semibold).foregroundColor(ink.opacity(0.75))
            Text(value)
                .font(.subheadline).fontWeight(.bold).foregroundColor(ink)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(Color.white.opacity(0.16))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var palette: some View {
        VStack(spacing: 8) {
            Text(Loc.gradientLabel(lang).uppercased())
                .font(.caption).fontWeight(.semibold).foregroundColor(ink.opacity(0.8))
            HStack(spacing: 10) {
                ForEach(tea.colors, id: \.self) { hex in
                    HStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 5)
                            .fill(Color(hex: hex))
                            .frame(width: 20, height: 20)
                            .overlay(RoundedRectangle(cornerRadius: 5).stroke(ink.opacity(0.3), lineWidth: 1))
                        Text(hex).font(.system(.footnote, design: .monospaced)).foregroundColor(ink)
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .frame(maxWidth: .infinity)
                    .background(Color.white.opacity(0.16))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }
}
