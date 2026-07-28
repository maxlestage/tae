import Foundation

/// Langues de l'interface.
enum Lang: String, CaseIterable, Identifiable {
    case fr, en, es
    var id: String { rawValue }
    var label: String { rawValue.uppercased() }
}

/// Chaîne traduite dans les trois langues.
struct Localized: Codable, Hashable {
    let fr: String
    let en: String
    let es: String

    subscript(_ l: Lang) -> String {
        switch l {
        case .fr: return fr
        case .en: return en
        case .es: return es
        }
    }
}

/// Un sachet de thé (décodé depuis teas.json — même source que le site/API).
struct Tea: Codable, Identifiable, Hashable {
    let id: String
    let name: Localized
    let desc: Localized
    let typeKey: String
    let family: String
    let colors: [String]
    let ink: String
    let caffeineFree: Bool
    let pyramid: Bool?
    let coldBrew: Bool?
    let coffret: Bool?
    let limited: Bool?
    let intensity: Int
    let ingredients: Localized?

    var isCoffret: Bool { coffret ?? false }
    var isPyramid: Bool { pyramid ?? false }
    var isColdBrew: Bool { coldBrew ?? false }
    var isLimited: Bool { limited ?? false }

    enum CodingKeys: String, CodingKey {
        case id, name
        case desc = "description"
        case typeKey, family, colors, ink, caffeineFree
        case pyramid, coldBrew, coffret, limited, intensity, ingredients
    }
}

struct Catalog: Codable {
    let count: Int
    let teas: [Tea]
}
