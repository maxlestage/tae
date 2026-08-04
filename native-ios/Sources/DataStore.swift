import Foundation

/// Charge le catalogue depuis teas.json embarqué dans le bundle (hors-ligne).
enum DataStore {
    static let teas: [Tea] = {
        guard
            let url = Bundle.main.url(forResource: "teas", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let catalog = try? JSONDecoder().decode(Catalog.self, from: data)
        else {
            assertionFailure("teas.json introuvable ou invalide")
            return []
        }
        return catalog.teas
    }()
}
