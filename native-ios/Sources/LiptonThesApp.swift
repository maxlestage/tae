import SwiftUI

/// Point d'entrée de l'app iOS native (SwiftUI).
@main
struct LiptonThesApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

/// Enchaîne l'écran de lancement puis le catalogue.
struct RootView: View {
    @AppStorage("tea-lang") private var langCode = Lang.fr.rawValue
    @State private var showSplash = true

    private var lang: Lang { Lang(rawValue: langCode) ?? .fr }

    var body: some View {
        ZStack {
            ContentView()

            if showSplash {
                SplashView(lang: lang) {
                    withAnimation(.easeOut(duration: 0.45)) { showSplash = false }
                }
                .transition(.opacity)
                .zIndex(1)
            }
        }
    }
}
