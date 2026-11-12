import logoUrl from '@/assets/card/card-logo.svg'
import mascotUrl from '@/assets/card/card-mascot.svg'
import starsUrl from '@/assets/card/card-stars.svg'
import stampUrl from '@/assets/card/case-closed-stamp.png'

/**
 * 사건 카드를 Canvas에 그려서 PNG로 만든다. 별도 라이브러리 없이 브라우저 기본 기능만 쓴다.
 * 화면 미리보기와 저장·공유하는 이미지가 같은 결과물이 되도록, 미리보기도 이 PNG를 그대로 보여준다.
 *
 * 좌표는 시안(Figma)의 화면 좌표를 그대로 쓰고, 카드의 왼쪽 위(55, 220)를 기준점으로 옮겨서 그린다.
 */

/** 이미지 선명도. 화면 크기의 3배로 그린다. */
const SCALE = 3
/** 카드 둘레의 그림자가 잘리지 않도록 두는 여백(px). */
const PAD = 12
const ORIGIN = { x: 55, y: 220 }

const PAPER = { x: 55, y: 223, width: 291 }
const BAND = { x: 58, y: 220, width: 288, height: 26 }
const STARS = { x: 62, y: 225, width: 279, height: 15 }
const LOGO = { x: 139, y: 257, width: 113, height: 23 }
const NUMBER_POSITION = { x: 166, y: 283 }
const WINDOW = { x: 79, y: 304, width: 245, height: 150 }
const MASCOT = { x: 149, y: 335, width: 115, height: 118 }
/** 도장 위치는 Figma 노드 좌표가 실제 모습과 달라서, 시안 화면에서 보이는 위치와 크기를 직접 재서 맞췄다. */
const STAMP = { x: 63, y: 300, width: 132, height: 66, opacity: 0.76 }

const TEXT = { x: 87, firstTitleY: 483, maxWidth: 232 }
const BODY_OFFSET = 22
const BODY_LINE_HEIGHT = 16
const BODY_FONT_SIZE = 12
const SECTION_GAP = 17
const PAPER_BOTTOM_PADDING = 30
/** 캔버스 글자는 시안(Figma)보다 살짝 위에 그려지므로 아래로 조금 내려서 맞춘다. */
const TEXT_OFFSET_Y = 1.5

const FALLBACK_COLORS = { ink: '#2f2f2f', sky: '#c1eaff', paper: '#f1f1f1' }

/** CSS 변수(디자인 토큰) 색을 읽는다. 읽을 수 없으면 시안의 색을 쓴다. */
const readColor = (name, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** 이미지를 불러온다. */
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했어요: ${src}`))
    image.src = src
  })

/** 카드에 쓰는 글꼴(Pretendard)이 준비될 때까지 기다린다. 준비되지 않으면 기본 글꼴로 그린다. */
const loadFonts = async () => {
  if (!document.fonts?.load) return
  await Promise.all([
    document.fonts.load('600 14px Pretendard'),
    document.fonts.load('400 12px Pretendard'),
  ]).catch(() => {})
}

/**
 * 글자를 정해진 너비 안에서 줄바꿈한다. 한글은 띄어쓰기가 없어도 되도록 글자 단위로 나눈다.
 * 최대 줄 수를 넘으면 마지막 줄 끝을 `…`로 줄인다.
 */
const wrapText = (ctx, text, maxWidth, maxLines) => {
  const lines = []
  let line = ''
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line += char
    }
  }
  if (line) lines.push(line)
  if (lines.length <= maxLines) return lines

  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
  kept[maxLines - 1] = `${last}…`
  return kept
}

/** 항상 같은 모양이 나오는 가짜 난수(-0.5 ~ 0.5). 찢어진 종이 가장자리를 같은 모양으로 그리려고 쓴다. */
const noise = (index) => {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value) - 0.5
}

/** 가장자리가 살짝 울퉁불퉁한 종이 모양을 그린다. */
const traceTornPaper = (ctx, x, y, width, height) => {
  const amplitude = 1.1
  const step = 3.5
  let n = 0
  const jitter = () => noise((n += 1)) * amplitude * 2

  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let px = x; px <= x + width; px += step) ctx.lineTo(px, y + jitter())
  for (let py = y; py <= y + height; py += step) ctx.lineTo(x + width + jitter(), py)
  for (let px = x + width; px >= x; px -= step) ctx.lineTo(px, y + height + jitter())
  for (let py = y + height; py >= y; py -= step) ctx.lineTo(x + jitter(), py)
  ctx.closePath()
}

/**
 * 사건 카드 PNG를 만든다.
 *
 * @param {{ number: string, thought: string, finalStatement: string, emotionChange: string }} content 카드에 넣을 문구
 * @returns {Promise<{ blob: Blob, width: number, height: number }>} PNG와 화면에서 보여줄 크기(px)
 */
export const renderCaseCard = async (content) => {
  const [logo, mascot, stars, stamp] = await Promise.all([
    loadImage(logoUrl),
    loadImage(mascotUrl),
    loadImage(starsUrl),
    loadImage(stampUrl),
    loadFonts(),
  ])

  const ink = readColor('--color-ink', FALLBACK_COLORS.ink)
  const sky = readColor('--color-sky', FALLBACK_COLORS.sky)
  const paper = readColor('--color-paper', FALLBACK_COLORS.paper)

  // 글자 줄 수를 알아야 카드 높이가 정해지므로, 측정용 캔버스로 먼저 줄바꿈한다.
  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `400 ${BODY_FONT_SIZE}px Pretendard, sans-serif`
  const sections = [
    { title: 'ORIGINAL THOUGHT', lines: wrapText(measure, content.thought, TEXT.maxWidth, 3) },
    {
      title: 'FINAL STATEMENT',
      lines: wrapText(measure, content.finalStatement, TEXT.maxWidth, 4),
    },
    { title: 'EMOTION CHANGE', lines: wrapText(measure, content.emotionChange, TEXT.maxWidth, 1) },
  ]

  let y = TEXT.firstTitleY
  const placed = sections.map((section) => {
    const titleY = y
    const bodyY = titleY + BODY_OFFSET
    const bodyHeight = BODY_FONT_SIZE + 2 + (section.lines.length - 1) * BODY_LINE_HEIGHT
    y = bodyY + bodyHeight + SECTION_GAP
    return { ...section, titleY, bodyY, bottom: bodyY + bodyHeight }
  })
  const paperBottom = placed[placed.length - 1].bottom + PAPER_BOTTOM_PADDING
  const paperHeight = paperBottom - PAPER.y

  const width = PAPER.width + PAD * 2
  const height = paperBottom - ORIGIN.y + PAD * 2

  const canvas = document.createElement('canvas')
  canvas.width = width * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  ctx.translate(PAD - ORIGIN.x, PAD - ORIGIN.y)
  ctx.textBaseline = 'top'

  // 종이와 그림자
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 3
  ctx.fillStyle = paper
  traceTornPaper(ctx, PAPER.x, PAPER.y, PAPER.width, paperHeight)
  ctx.fill()
  ctx.restore()

  // 위쪽 어두운 띠와 별
  ctx.fillStyle = ink
  ctx.fillRect(BAND.x, BAND.y, BAND.width, BAND.height)
  ctx.drawImage(stars, STARS.x, STARS.y, STARS.width, STARS.height)

  // 로고와 사건번호
  ctx.drawImage(logo, LOGO.x, LOGO.y, LOGO.width, LOGO.height)
  ctx.fillStyle = '#000'
  ctx.font = `400 ${BODY_FONT_SIZE}px Pretendard, sans-serif`
  ctx.fillText(content.number, NUMBER_POSITION.x, NUMBER_POSITION.y + TEXT_OFFSET_Y)

  // 하늘색 점선 상자, 마스코트, 도장
  ctx.fillStyle = sky
  ctx.beginPath()
  ctx.roundRect(WINDOW.x, WINDOW.y, WINDOW.width, WINDOW.height, 5)
  ctx.fill()
  ctx.save()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.setLineDash([2, 2])
  ctx.beginPath()
  ctx.roundRect(WINDOW.x + 1, WINDOW.y + 1, WINDOW.width - 2, WINDOW.height - 2, 4)
  ctx.stroke()
  ctx.restore()
  ctx.drawImage(mascot, MASCOT.x, MASCOT.y, MASCOT.width, MASCOT.height)
  ctx.save()
  ctx.globalAlpha = STAMP.opacity
  ctx.drawImage(stamp, STAMP.x, STAMP.y, STAMP.width, STAMP.height)
  ctx.restore()

  // 글자
  ctx.fillStyle = '#000'
  placed.forEach((section) => {
    ctx.font = '600 14px Pretendard, sans-serif'
    ctx.fillText(section.title, TEXT.x, section.titleY + TEXT_OFFSET_Y)
    ctx.font = `400 ${BODY_FONT_SIZE}px Pretendard, sans-serif`
    section.lines.forEach((line, index) => {
      ctx.fillText(line, TEXT.x, section.bodyY + index * BODY_LINE_HEIGHT + TEXT_OFFSET_Y)
    })
  })

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('이미지를 만들지 못했어요.'))),
      'image/png',
    )
  })
  return { blob, width, height }
}
