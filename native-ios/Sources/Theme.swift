import SwiftUI

extension Color {
    /// Construit une couleur depuis un hex "#rrggbb".
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r = Double((v >> 16) & 0xff) / 255
        let g = Double((v >> 8) & 0xff) / 255
        let b = Double(v & 0xff) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}

enum Palette {
    /// Éclaircit un hex vers le blanc (0–1) et renvoie une Color.
    static func lighten(_ hex: String, _ amount: Double) -> Color {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        func mix(_ c: Double) -> Double { c + (255 - c) * amount }
        let r = mix(Double((v >> 16) & 0xff)) / 255
        let g = mix(Double((v >> 8) & 0xff)) / 255
        let b = mix(Double(v & 0xff)) / 255
        return Color(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }

    /// Dégradé aux couleurs du thé (reflet clair → teinte → accent).
    static func gradient(_ tea: Tea) -> LinearGradient {
        let from = tea.colors.first ?? "#cccccc"
        let to = tea.colors.count > 1 ? tea.colors[1] : from
        return LinearGradient(
            stops: [
                .init(color: lighten(from, 0.45), location: 0.0),
                .init(color: Color(hex: from), location: 0.4),
                .init(color: Color(hex: to), location: 1.0),
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Couleur représentative d'une famille (pour la pastille).
    static func family(_ family: String) -> Color {
        let hex: [String: String] = [
            "Jaune": "#ffe105", "Ambre": "#d98032", "Rouge": "#e20025",
            "Rose": "#e06b97", "Violet": "#7b2d8e", "Bleu": "#3a6ea5",
            "Vert": "#2e9e4f", "Coffret": "#b06fb0",
        ]
        return Color(hex: hex[family] ?? "#999999")
    }
}
