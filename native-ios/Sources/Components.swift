import SwiftUI

/// Texture toile, superposée au dégradé (comme sur le site).
struct TextureOverlay: View {
    var opacity: Double = 0.18
    var body: some View {
        Image("Texture")
            .resizable()
            .scaledToFill()
            .opacity(opacity)
            .allowsHitTesting(false)
    }
}

/// Petit sachet de thé dessiné (ficelle + étiquette « Lipton »).
struct SachetBadge: View {
    let ink: Color
    var body: some View {
        VStack(spacing: 0) {
            Rectangle().fill(ink).frame(width: 1.5, height: 20)
            RoundedRectangle(cornerRadius: 8)
                .stroke(ink, lineWidth: 2)
                .frame(width: 78, height: 56)
                .overlay(
                    Text("Lipton")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color(hex: "#e20025"))
                        .clipShape(RoundedRectangle(cornerRadius: 3))
                )
        }
    }
}

/// Points d'intensité 1–5.
struct IntensityDots: View {
    let value: Int
    let ink: Color
    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...5, id: \.self) { i in
                Circle()
                    .fill(i <= value ? ink : Color.clear)
                    .overlay(Circle().stroke(ink, lineWidth: 1.4))
                    .frame(width: 12, height: 12)
            }
        }
    }
}

/// Carte d'un sachet (dégradé + texture + infos).
struct TeaCard: View {
    let tea: Tea
    let lang: Lang

    private var ink: Color { Color(hex: tea.ink) }

    var body: some View {
        ZStack {
            Palette.gradient(tea)
            TextureOverlay()
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    Text(Loc.typeName(tea.typeKey, lang).uppercased())
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(ink.opacity(0.85))
                    Spacer()
                    Text(tea.caffeineFree ? Loc.caffeineFree(lang) : Loc.caffeinated(lang))
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(ink)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .overlay(Capsule().stroke(ink.opacity(0.5), lineWidth: 1))
                }
                SachetBadge(ink: ink)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                Text(tea.name[lang])
                    .font(.title2)
                    .fontWeight(.heavy)
                    .foregroundColor(ink)
                Text(tea.desc[lang])
                    .font(.subheadline)
                    .foregroundColor(ink.opacity(0.9))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(18)
        }
        .frame(maxWidth: .infinity)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.18), radius: 10, x: 0, y: 6)
    }
}
