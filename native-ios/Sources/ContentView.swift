import SwiftUI

enum SortMode: String, CaseIterable { case color, intensity }

struct TeaGroup: Identifiable {
    let id: String
    let title: String
    let color: Color
    let teas: [Tea]
}

struct ContentView: View {
    @State private var lang: Lang = .fr
    @State private var sort: SortMode = .color
    @State private var family: String? = nil
    @State private var collapsed: Set<String> = []
    @State private var selected: Tea? = nil

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                topBar
                header
                countryBadge
                familyChips
                sortPicker
                ForEach(groups) { group in
                    section(group)
                }
                footer
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
        .sheet(item: $selected) { tea in
            TeaDetailView(tea: tea, lang: lang)
        }
    }

    // MARK: Données

    private var filtered: [Tea] {
        DataStore.teas.filter { family == nil || $0.family == family }
    }

    private var groups: [TeaGroup] {
        switch sort {
        case .color:
            return Loc.familyOrder.compactMap { fam in
                let teas = filtered.filter { $0.family == fam }
                guard !teas.isEmpty else { return nil }
                return TeaGroup(id: fam, title: Loc.familyLabel(fam, lang),
                                color: Palette.family(fam), teas: teas)
            }
        case .intensity:
            return stride(from: 5, through: 1, by: -1).compactMap { lvl in
                let teas = filtered.filter { !$0.isCoffret && $0.intensity == lvl }
                guard !teas.isEmpty else { return nil }
                return TeaGroup(id: "i\(lvl)", title: "\(Loc.intensityLabel(lang)) \(lvl)/5",
                                color: Color(hex: "#8a8a8a"), teas: teas)
            }
        }
    }

    private func toggle(_ id: String) {
        if collapsed.contains(id) { collapsed.remove(id) } else { collapsed.insert(id) }
    }

    // MARK: Sous-vues

    private var topBar: some View {
        HStack {
            Picker("", selection: $lang) {
                ForEach(Lang.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.segmented)
            .frame(width: 170)
            Spacer()
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            Text("COLLECTION").font(.caption).kerning(3).foregroundColor(.secondary)
            HStack(spacing: 8) {
                Text(Loc.title(lang)).font(.system(size: 32, weight: .heavy))
                Text("Lipton")
                    .font(.system(size: 20, weight: .heavy)).foregroundColor(.white)
                    .padding(.horizontal, 10).padding(.vertical, 4)
                    .background(Color(hex: "#e20025"))
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            }
            Text(Loc.subtitle(lang))
                .font(.subheadline).foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var countryBadge: some View {
        Text("🇫🇷 " + Loc.country(lang))
            .font(.footnote).fontWeight(.semibold)
            .padding(.horizontal, 14).padding(.vertical, 6)
            .background(Color(.secondarySystemBackground))
            .clipShape(Capsule())
    }

    private var familyChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                chip(title: Loc.all(lang), color: nil, active: family == nil) { family = nil }
                ForEach(Loc.familyOrder, id: \.self) { fam in
                    if DataStore.teas.contains(where: { $0.family == fam }) {
                        chip(title: Loc.familyLabel(fam, lang),
                             color: Palette.family(fam),
                             active: family == fam) {
                            family = (family == fam ? nil : fam)
                        }
                    }
                }
            }
            .padding(.horizontal, 2)
        }
    }

    private func chip(title: String, color: Color?, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let color = color {
                    Circle().fill(color).frame(width: 10, height: 10)
                }
                Text(title).font(.subheadline).fontWeight(.semibold)
            }
            .padding(.horizontal, 14).padding(.vertical, 8)
            .background(active ? Color.primary : Color(.secondarySystemBackground))
            .foregroundColor(active ? Color(.systemBackground) : .primary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private var sortPicker: some View {
        Picker(Loc.sortBy(lang), selection: $sort) {
            Text(Loc.sortColour(lang)).tag(SortMode.color)
            Text(Loc.sortIntensity(lang)).tag(SortMode.intensity)
        }
        .pickerStyle(.segmented)
    }

    private func section(_ group: TeaGroup) -> some View {
        let expanded = !collapsed.contains(group.id)
        return VStack(spacing: 12) {
            Button { withAnimation(.easeInOut(duration: 0.2)) { toggle(group.id) } } label: {
                HStack(spacing: 10) {
                    Circle().fill(group.color).frame(width: 18, height: 18)
                    Text(group.title).font(.title3).fontWeight(.bold).foregroundColor(.primary)
                    Spacer()
                    Text("\(group.teas.count)")
                        .font(.subheadline).foregroundColor(.secondary)
                        .padding(.horizontal, 10).padding(.vertical, 3)
                        .overlay(Capsule().stroke(Color.secondary.opacity(0.3), lineWidth: 1))
                    Image(systemName: "chevron.down")
                        .foregroundColor(.secondary)
                        .rotationEffect(.degrees(expanded ? 0 : -90))
                }
                .padding(14)
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            .buttonStyle(.plain)

            if expanded {
                ForEach(group.teas) { tea in
                    Button { selected = tea } label: {
                        TeaCard(tea: tea, lang: lang)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var footer: some View {
        Text("© 2026 @maxlestage · \(DataStore.teas.count) sachets")
            .font(.footnote).foregroundColor(.secondary)
            .padding(.top, 8)
    }
}
