import AppKit
import Foundation
import ImageIO

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: red-sea-thumbnail-overlay.swift <background> <output>\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let canvasSize = NSSize(width: 1280, height: 720)

guard let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
      let backgroundCGImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    fputs("Could not load background image\n", stderr)
    exit(1)
}
let background = NSImage(cgImage: backgroundCGImage, size: NSSize(width: backgroundCGImage.width, height: backgroundCGImage.height))

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(canvasSize.width),
    pixelsHigh: Int(canvasSize.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .calibratedRGB,
    bitmapFormat: [],
    bytesPerRow: 0,
    bitsPerPixel: 0
) else {
    fputs("Could not allocate bitmap\n", stderr)
    exit(1)
}

NSGraphicsContext.saveGraphicsState()
guard let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("Could not create graphics context\n", stderr)
    exit(1)
}
NSGraphicsContext.current = graphicsContext
defer { NSGraphicsContext.restoreGraphicsState() }

background.draw(
    in: NSRect(origin: .zero, size: canvasSize),
    from: NSRect(origin: .zero, size: background.size),
    operation: .sourceOver,
    fraction: 1.0
)

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat, _ alpha: CGFloat = 1) -> NSColor {
    NSColor(calibratedRed: red, green: green, blue: blue, alpha: alpha)
}

func fill(_ rect: NSRect, with fillColor: NSColor) {
    fillColor.setFill()
    rect.fill()
}

func font(_ names: [String], size: CGFloat, fallbackWeight: NSFont.Weight = .bold) -> NSFont {
    for name in names {
        if let candidate = NSFont(name: name, size: size) {
            return candidate
        }
    }
    return NSFont.systemFont(ofSize: size, weight: fallbackWeight)
}

func drawText(
    _ string: String,
    at point: NSPoint,
    font: NSFont,
    color: NSColor,
    kern: CGFloat = 0,
    shadow: NSShadow? = nil
) {
    var attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color
    ]
    if kern != 0 {
        attributes[.kern] = kern
    }
    if let shadow {
        attributes[.shadow] = shadow
    }
    NSAttributedString(string: string, attributes: attributes).draw(at: point)
}

let navy = color(0.02, 0.08, 0.14, 0.78)
let cream = color(0.98, 0.98, 0.93)
let gold = color(1.0, 0.79, 0.47)
let signalRed = color(1.0, 0.36, 0.36)

// Give the headline a clean, high-contrast reading zone while preserving the ship and gate.
fill(NSRect(x: 0, y: 0, width: 720, height: 720), with: navy)
fill(NSRect(x: 70, y: 316, width: 10, height: 170), with: signalRed)

let textShadow = NSShadow()
textShadow.shadowColor = color(0, 0, 0, 0.72)
textShadow.shadowBlurRadius = 7
textShadow.shadowOffset = NSSize(width: 2, height: -3)

drawText(
    "CAN IT REOPEN?",
    at: NSPoint(x: 96, y: 615),
    font: font(["Avenir Next Heavy", "Avenir Next Bold"], size: 28),
    color: gold,
    kern: 3.0
)

drawText(
    "RED SEA",
    at: NSPoint(x: 96, y: 432),
    font: font(["Avenir Next Condensed Heavy", "Avenir Next Condensed Bold"], size: 96),
    color: cream,
    shadow: textShadow
)

drawText(
    "STILL CLOSED",
    at: NSPoint(x: 96, y: 332),
    font: font(["Avenir Next Condensed Heavy", "Avenir Next Condensed Bold"], size: 80),
    color: cream,
    shadow: textShadow
)

fill(NSRect(x: 96, y: 304, width: 470, height: 3), with: gold)

fill(NSRect(x: 96, y: 108, width: 450, height: 58), with: signalRed)
drawText(
    "10% OF WORLD TRADE",
    at: NSPoint(x: 120, y: 125),
    font: font(["Avenir Next Heavy", "Avenir Next Bold"], size: 26),
    color: cream,
    kern: 1.0
)

drawText(
    "GOODANDBADDAILY / LANDSCAPE DESK",
    at: NSPoint(x: 96, y: 34),
    font: font(["Avenir Next Bold", "Avenir Next"], size: 17),
    color: gold,
    kern: 2.0
)

guard let jpeg = bitmap.representation(
    using: NSBitmapImageRep.FileType.jpeg,
    properties: [NSBitmapImageRep.PropertyKey.compressionFactor: 0.92]
) else {
    fputs("Could not encode thumbnail\n", stderr)
    exit(1)
}

do {
    try jpeg.write(to: outputURL, options: Data.WritingOptions.atomic)
} catch {
    fputs("Could not save thumbnail: \(error)\n", stderr)
    exit(1)
}
