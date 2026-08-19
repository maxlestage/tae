import SwiftUI

/// Écran de lancement animé, affiché le temps que le catalogue soit décodé.
///
/// iOS impose un *launch screen* statique (Apple interdit d'y mettre logo ou
/// texte de marque) : il sert de premier plan instantané, puis cette vue prend
/// le relais pour l'animation et les crédits.
///
/// Ce n'est pas une attente factice : le décodage de `teas.json` est réellement
/// déclenché ici, et l'écran reste seulement le temps d'une durée minimale
/// d'affichage — s'il est déjà prêt, on enchaîne aussitôt après celle-ci.
struct SplashView: View {
    let lang: Lang
    let onFinish: () -> Void

    /// Durée minimale d'affichage, pour éviter un flash désagréable.
    private let minimumDisplay: TimeInterval = 1.6

    private let ink = Color(hex: "#4a1206")

    @State private var badgeIn = false
    @State private var titleIn = false
    @State private var creditsIn = false

    var body: some View {
        ZStack {
            background

            VStack(spacing: 0) {
                Spacer()

                // Le sachet « descend » dans la tasse, comme une infusion.
                SachetBadge(ink: ink)
                    .scaleEffect(badgeIn ? 1 : 0.86)
                    .offset(y: badgeIn ? 0 : -26)
                    .opacity(badgeIn ? 1 : 0)

                VStack(spacing: 10) {
                    Text("Lipton")
                        .font(.system(size: 30, weight: .heavy))
                        .foregroundColor(.white)
                        .padding(.horizontal, 18).padding(.vertical, 7)
                        .background(Color(hex: "#e20025"))
                        .clipShape(RoundedRectangle(cornerRadius: 9))

                    Text(Loc.title(lang))
                        .font(.title2).fontWeight(.heavy)
                        .foregroundColor(ink)
                }
                .padding(.top, 26)
                .opacity(titleIn ? 1 : 0)
                .offset(y: titleIn ? 0 : 10)

                steeping
                    .padding(.top, 26)
                    .opacity(titleIn ? 1 : 0)

                Spacer()

                credits
                    .opacity(creditsIn ? 1 : 0)
                    .offset(y: creditsIn ? 0 : 8)
                    .padding(.bottom, 42)
            }
            .padding(.horizontal, 28)
        }
        .onAppear(perform: animateIn)
        .task { await finishWhenReady() }
    }

    // MARK: Éléments

    private var background: some View {
        LinearGradient(
            stops: [
                .init(color: Palette.lighten("#ffe105", 0.42), location: 0),
                .init(color: Color(hex: "#ffe105"), location: 0.45),
                .init(color: Color(hex: "#e20025"), location: 1),
            ],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
        .overlay(TextureOverlay(opacity: 0.14))
        .ignoresSafeArea()
    }

    /// Trois gouttes qui pulsent tour à tour — l'indicateur de chargement.
    private var steeping: some View {
        VStack(spacing: 12) {
            HStack(spacing: 9) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(ink.opacity(0.85))
                        .frame(width: 8, height: 8)
                        .scaleEffect(titleIn ? 1 : 0.5)
                        .opacity(titleIn ? 1 : 0.35)
                        .animation(
                            .easeInOut(duration: 0.6)
                                .repeatForever()
                                .delay(Double(i) * 0.18),
                            value: titleIn
                        )
                }
            }
            Text(Loc.splashLoading(lang))
                .font(.footnote).fontWeight(.semibold)
                .foregroundColor(ink.opacity(0.75))
        }
    }

    private var credits: some View {
        VStack(spacing: 4) {
            Text(Loc.splashCreatedBy(lang).uppercased())
                .font(.caption2).fontWeight(.semibold)
                .kerning(1.2)
                .foregroundColor(ink.opacity(0.7))
            Text("Maxime Nathan Lestage")
                .font(.headline).fontWeight(.bold)
                .foregroundColor(ink)
            Text("@maxlestage")
                .font(.caption)
                .foregroundColor(ink.opacity(0.7))
        }
        .multilineTextAlignment(.center)
    }

    // MARK: Enchaînement

    private func animateIn() {
        withAnimation(.spring(response: 0.7, dampingFraction: 0.72)) { badgeIn = true }
        withAnimation(.easeOut(duration: 0.5).delay(0.22)) { titleIn = true }
        withAnimation(.easeOut(duration: 0.5).delay(0.42)) { creditsIn = true }
    }

    private func finishWhenReady() async {
        let start = Date()
        // Force le décodage du catalogue pendant que l'animation tourne.
        _ = DataStore.teas.count
        let elapsed = Date().timeIntervalSince(start)
        if elapsed < minimumDisplay {
            let remaining = minimumDisplay - elapsed
            try? await Task.sleep(nanoseconds: UInt64(remaining * 1_000_000_000))
        }
        onFinish()
    }
}
