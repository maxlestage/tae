import Foundation

/// Textes d'interface et libellés traduits (repris de src/i18n.ts).
enum Loc {
    static func title(_ l: Lang) -> String {
        [.fr: "Sachets de thé", .en: "Tea bags", .es: "Bolsitas de té"][l]!
    }
    static func subtitle(_ l: Lang) -> String {
        [.fr: "Triés par couleurs — touchez un thé pour sa fiche.",
         .en: "Sorted by colour — tap a tea for its card.",
         .es: "Ordenados por color — toca un té para su ficha."][l]!
    }
    static func country(_ l: Lang) -> String {
        [.fr: "Gamme vendue en France", .en: "Range sold in France", .es: "Gama vendida en Francia"][l]!
    }
    static func all(_ l: Lang) -> String { [.fr: "Toutes", .en: "All", .es: "Todas"][l]! }
    static func sortBy(_ l: Lang) -> String {
        [.fr: "Trier par", .en: "Sort by", .es: "Ordenar por"][l]!
    }
    static func sortColour(_ l: Lang) -> String { [.fr: "Couleur", .en: "Colour", .es: "Color"][l]! }
    static func sortIntensity(_ l: Lang) -> String { [.fr: "Intensité", .en: "Intensity", .es: "Intensidad"][l]! }

    static func caffeinated(_ l: Lang) -> String { [.fr: "Théiné", .en: "Caffeinated", .es: "Con teína"][l]! }
    static func caffeineFree(_ l: Lang) -> String { [.fr: "Sans théine", .en: "Caffeine-free", .es: "Sin teína"][l]! }

    static func typeLabel(_ l: Lang) -> String { [.fr: "Type", .en: "Type", .es: "Tipo"][l]! }
    static func colourLabel(_ l: Lang) -> String { [.fr: "Couleur", .en: "Colour", .es: "Color"][l]! }
    static func caffeineLabel(_ l: Lang) -> String { [.fr: "Théine", .en: "Caffeine", .es: "Teína"][l]! }
    static func formatLabel(_ l: Lang) -> String { [.fr: "Format", .en: "Format", .es: "Formato"][l]! }
    static func intensityLabel(_ l: Lang) -> String { [.fr: "Intensité", .en: "Intensity", .es: "Intensidad"][l]! }
    static func ingredientsLabel(_ l: Lang) -> String { [.fr: "Ingrédients", .en: "Ingredients", .es: "Ingredientes"][l]! }
    static func gradientLabel(_ l: Lang) -> String { [.fr: "Dégradé du thé", .en: "Tea gradient", .es: "Degradado del té"][l]! }
    static func certification(_ l: Lang) -> String {
        [.fr: "Certification · Rainforest Alliance",
         .en: "Certification · Rainforest Alliance",
         .es: "Certificación · Rainforest Alliance"][l]!
    }
    static func varied(_ l: Lang) -> String { [.fr: "Varié", .en: "Varies", .es: "Variado"][l]! }

    static func fmt(_ tea: Tea, _ l: Lang) -> String {
        if tea.isCoffret { return [.fr: "Assortiment", .en: "Assortment", .es: "Surtido"][l]! }
        if tea.isColdBrew { return [.fr: "Infuse à froid", .en: "Cold brew", .es: "Infusión en frío"][l]! }
        if tea.isPyramid { return [.fr: "Sachet pyramide", .en: "Pyramid bag", .es: "Pirámide"][l]! }
        return [.fr: "Sachet", .en: "Tea bag", .es: "Bolsita"][l]!
    }

    // Familles de couleur : ordre d'affichage + libellés.
    static let familyOrder = ["Jaune", "Ambre", "Rouge", "Rose", "Violet", "Bleu", "Vert", "Coffret"]

    static func familyLabel(_ family: String, _ l: Lang) -> String {
        let table: [String: [Lang: String]] = [
            "Jaune": [.fr: "Jaune", .en: "Yellow", .es: "Amarillo"],
            "Ambre": [.fr: "Ambre", .en: "Amber", .es: "Ámbar"],
            "Rouge": [.fr: "Rouge", .en: "Red", .es: "Rojo"],
            "Rose": [.fr: "Rose", .en: "Pink", .es: "Rosa"],
            "Violet": [.fr: "Violet", .en: "Purple", .es: "Morado"],
            "Bleu": [.fr: "Bleu", .en: "Blue", .es: "Azul"],
            "Vert": [.fr: "Vert", .en: "Green", .es: "Verde"],
            "Coffret": [.fr: "Coffrets", .en: "Gift Sets", .es: "Estuches"],
        ]
        return table[family]?[l] ?? family
    }

    static func typeName(_ key: String, _ l: Lang) -> String {
        let table: [String: [Lang: String]] = [
            "blackTea": [.fr: "Thé noir", .en: "Black tea", .es: "Té negro"],
            "blackTeaFlavored": [.fr: "Thé noir aromatisé", .en: "Flavoured black tea", .es: "Té negro aromatizado"],
            "blackTeaSpiced": [.fr: "Thé noir épicé", .en: "Spiced black tea", .es: "Té negro especiado"],
            "greenTea": [.fr: "Thé vert", .en: "Green tea", .es: "Té verde"],
            "greenTeaFlavored": [.fr: "Thé vert aromatisé", .en: "Flavoured green tea", .es: "Té verde aromatizado"],
            "whiteTea": [.fr: "Thé blanc", .en: "White tea", .es: "Té blanco"],
            "rooibos": [.fr: "Rooibos", .en: "Rooibos", .es: "Rooibos"],
            "infusion": [.fr: "Infusion", .en: "Herbal infusion", .es: "Infusión"],
            "infusionFruity": [.fr: "Infusion fruitée", .en: "Fruit infusion", .es: "Infusión de frutas"],
            "coffret": [.fr: "Coffret", .en: "Gift set", .es: "Estuche"],
        ]
        return table[key]?[l] ?? key
    }
}
