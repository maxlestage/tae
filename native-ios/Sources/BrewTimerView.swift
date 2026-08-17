import SwiftUI
import AudioToolbox
import UIKit

/// Conseil d'infusion : température affichée + fourchette de durée (minutes).
/// Mêmes valeurs que le site (voir `brewSpec` dans src/App.tsx).
struct BrewSpec {
    /// Libellé de température, ou `nil` pour une infusion à froid.
    let temp: String?
    let minMinutes: Int
    let maxMinutes: Int
}

func brewSpec(for tea: Tea) -> BrewSpec? {
    if tea.isCoffret { return nil }
    if tea.isColdBrew { return BrewSpec(temp: nil, minMinutes: 5, maxMinutes: 10) }
    switch tea.typeKey {
    case "blackTea", "blackTeaFlavored", "blackTeaSpiced":
        return BrewSpec(temp: "90–95 °C", minMinutes: 3, maxMinutes: 4)
    case "greenTea", "greenTeaFlavored":
        return BrewSpec(temp: "75–80 °C", minMinutes: 2, maxMinutes: 3)
    case "whiteTea":
        return BrewSpec(temp: "70–75 °C", minMinutes: 2, maxMinutes: 3)
    case "rooibos":
        return BrewSpec(temp: "95–100 °C", minMinutes: 5, maxMinutes: 7)
    default:
        return BrewSpec(temp: "95–100 °C", minMinutes: 5, maxMinutes: 6)
    }
}

/// Libellé « température · durée » pour la grille de caractéristiques.
func brewInfo(for tea: Tea, _ lang: Lang) -> String? {
    guard let s = brewSpec(for: tea) else { return nil }
    return "\(s.temp ?? Loc.coldWater(lang)) · \(s.minMinutes)–\(s.maxMinutes) min"
}

/// Minuteur d'infusion, propre à chaque thé.
///
/// La durée est pré-réglée sur le temps conseillé du thé, mais **réglable** par
/// pas de 30 s ; le choix est **mémorisé par thé** (`UserDefaults`, clé
/// `brew.<id>`), donc on le retrouve à la prochaine ouverture de la fiche.
///
/// Le décompte s'appuie sur une échéance absolue (`Date`) plutôt que sur un
/// cumul de ticks : il reste juste même si l'app passe en arrière-plan.
struct BrewTimerView: View {
    let tea: Tea
    let lang: Lang
    let ink: Color

    /// Durée choisie pour ce thé, en secondes (persistée).
    @AppStorage private var seconds: Int

    /// Temps restant ; `nil` = minuteur à l'arrêt, non entamé.
    @State private var remaining: Double?
    @State private var running = false
    @State private var done = false
    @State private var deadline: Date?

    private let ticker = Timer.publish(every: 0.2, on: .main, in: .common).autoconnect()

    private static let minSeconds = 30
    private static let maxSeconds = 20 * 60

    init(tea: Tea, lang: Lang, ink: Color) {
        self.tea = tea
        self.lang = lang
        self.ink = ink
        let preset = (brewSpec(for: tea)?.minMinutes ?? 3) * 60
        _seconds = AppStorage(wrappedValue: preset, "brew.\(tea.id)")
    }

    private var left: Double { remaining ?? Double(seconds) }

    private var progress: Double {
        guard seconds > 0 else { return 0 }
        return min(1, max(0, 1 - left / Double(seconds)))
    }

    private var clock: String {
        let s = max(0, Int(left.rounded(.up)))
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    private var primaryLabel: String {
        if done { return Loc.timerReset(lang) }
        if running { return Loc.timerPause(lang) }
        return remaining == nil ? Loc.timerStart(lang) : Loc.timerResume(lang)
    }

    var body: some View {
        if let spec = brewSpec(for: tea) {
            VStack(spacing: 10) {
                Text(Loc.timerLabel(lang).uppercased())
                    .font(.caption).fontWeight(.semibold)
                    .foregroundColor(ink.opacity(0.75))

                // Disposition verticale : côte à côte, les puces de réglage
                // n'avaient pas la place et se coupaient caractère par caractère.
                dial
                controls

                Text(done
                     ? Loc.timerDone(lang)
                     : Loc.timerAdvised(lang, range: "\(spec.minMinutes)–\(spec.maxMinutes) min"))
                    .font(.footnote)
                    .fontWeight(done ? .bold : .regular)
                    .foregroundColor(ink.opacity(done ? 1 : 0.75))
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(Color.white.opacity(0.16))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .onReceive(ticker) { _ in tick() }
            .onChange(of: running) { isRunning in
                // Garde l'écran allumé pendant l'infusion.
                UIApplication.shared.isIdleTimerDisabled = isRunning
            }
            .onDisappear {
                UIApplication.shared.isIdleTimerDisabled = false
            }
        }
    }

    private var dial: some View {
        ZStack {
            Circle()
                .stroke(ink.opacity(0.22), lineWidth: 5)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(ink, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text(clock)
                .font(.title).fontWeight(.heavy)
                .monospacedDigit()
                .lineLimit(1)
                .foregroundColor(ink)
        }
        .frame(width: 108, height: 108)
    }

    private var controls: some View {
        VStack(spacing: 10) {
            // Réglage : deux puces courtes + une icône pour la remise à zéro.
            // Le mot « Réinitialiser » est trop long ici et forçait le retour
            // à la ligne caractère par caractère.
            HStack(spacing: 8) {
                adjustButton("−30 s", delta: -30, label: Loc.timerLess(lang),
                             disabled: seconds <= Self.minSeconds)
                adjustButton("+30 s", delta: 30, label: Loc.timerMore(lang),
                             disabled: seconds >= Self.maxSeconds)
                if !done, remaining != nil {
                    Button(action: reset) {
                        chip(Image(systemName: "arrow.counterclockwise"))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Loc.timerReset(lang))
                }
            }

            Button(action: primaryAction) {
                Text(primaryLabel)
                    .font(.subheadline).fontWeight(.bold)
                    .lineLimit(1)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
                    .background(ink)
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
        }
    }

    private func adjustButton(_ title: String, delta: Int, label: String, disabled: Bool) -> some View {
        Button { adjust(by: delta) } label: { chip(Text(title)) }
            .buttonStyle(.plain)
            .disabled(disabled)
            .opacity(disabled ? 0.4 : 1)
            .accessibilityLabel(label)
    }

    /// Puce compacte : `lineLimit(1)` + `fixedSize` pour qu'elle ne se coupe jamais.
    private func chip<Content: View>(_ content: Content) -> some View {
        content
            .font(.caption).fontWeight(.bold)
            .lineLimit(1)
            .fixedSize(horizontal: true, vertical: false)
            .foregroundColor(ink)
            .padding(.horizontal, 12).padding(.vertical, 7)
            .background(Color.white.opacity(0.28))
            .overlay(Capsule().stroke(ink.opacity(0.5), lineWidth: 1))
            .clipShape(Capsule())
    }

    // MARK: Actions

    private func tick() {
        guard running, let deadline else { return }
        let secondsLeft = deadline.timeIntervalSinceNow
        if secondsLeft <= 0 {
            remaining = 0
            running = false
            done = true
            signalDone()
        } else {
            remaining = secondsLeft
        }
    }

    private func primaryAction() {
        if done {
            reset()
        } else if running {
            running = false            // pause : `remaining` conserve la valeur
        } else {
            let start = remaining ?? Double(seconds)
            deadline = Date().addingTimeInterval(start)
            remaining = start
            running = true
        }
    }

    private func reset() {
        running = false
        done = false
        remaining = nil
        deadline = nil
    }

    private func adjust(by delta: Int) {
        seconds = min(Self.maxSeconds, max(Self.minSeconds, seconds + delta))
        reset()
    }

    /// Fin d'infusion : son système + retour haptique.
    private func signalDone() {
        AudioServicesPlaySystemSound(1005)
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}
