import { useState, useEffect, useRef, useCallback } from 'react'
import { Youtube, Play, Loader2 } from 'lucide-react'
import {
  SiX, SiInstagram, SiTiktok, SiYoutube, SiGithub, SiGitlab,
  SiFacebook, SiTwitch, SiDribbble, SiMedium, SiDevdotto, SiReddit,
  SiPinterest, SiThreads, SiBluesky, SiMastodon, SiSubstack, SiPatreon,
  SiKofi, SiBuymeacoffee, SiSnapchat, SiDiscord, SiTelegram, SiWhatsapp,
} from 'react-icons/si'
import { FaLinkedinIn } from 'react-icons/fa6'
import { Globe, Link as LinkIcon } from 'lucide-react'
import type { IconType } from 'react-icons'
import type { LucideIcon } from 'lucide-react'


// Types
enum BlockType {
  LINK = 'LINK',
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  SOCIAL = 'SOCIAL',
  SOCIAL_ICON = 'SOCIAL_ICON',
  MAP = 'MAP',
  SPACER = 'SPACER'
}

type SocialPlatform = 'x' | 'instagram' | 'tiktok' | 'youtube' | 'github' | 'gitlab' | 'linkedin' | 'facebook' | 'twitch' | 'dribbble' | 'medium' | 'devto' | 'reddit' | 'pinterest' | 'threads' | 'bluesky' | 'mastodon' | 'substack' | 'patreon' | 'kofi' | 'buymeacoffee' | 'website' | 'snapchat' | 'discord' | 'telegram' | 'whatsapp' | 'custom'

interface BlockData {
  id: string
  type: BlockType
  title?: string
  content?: string
  subtext?: string
  imageUrl?: string
  mediaPosition?: { x: number; y: number }
  colSpan: number
  rowSpan: number
  color?: string
  customBackground?: string
  textColor?: string
  gridColumn?: number
  gridRow?: number
  channelId?: string
  youtubeVideoId?: string
  channelTitle?: string
  youtubeMode?: 'single' | 'grid' | 'list'
  youtubeVideos?: Array<{ id: string; title: string; thumbnail: string }>
  socialPlatform?: SocialPlatform
  socialHandle?: string
  zIndex?: number
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${import.meta.env.BASE_URL}${url.slice(1)}`
  return url
}


// Social platforms config
const SOCIAL_PLATFORMS: Record<string, { icon: IconType | LucideIcon; brandColor: string; buildUrl: (h: string) => string }> = {
  x: { icon: SiX, brandColor: '#000000', buildUrl: (h) => `https://x.com/${h}` },
  instagram: { icon: SiInstagram, brandColor: '#E4405F', buildUrl: (h) => `https://instagram.com/${h}` },
  tiktok: { icon: SiTiktok, brandColor: '#000000', buildUrl: (h) => `https://tiktok.com/@${h}` },
  youtube: { icon: SiYoutube, brandColor: '#FF0000', buildUrl: (h) => `https://youtube.com/@${h}` },
  github: { icon: SiGithub, brandColor: '#181717', buildUrl: (h) => `https://github.com/${h}` },
  gitlab: { icon: SiGitlab, brandColor: '#FC6D26', buildUrl: (h) => `https://gitlab.com/${h}` },
  linkedin: { icon: FaLinkedinIn, brandColor: '#0A66C2', buildUrl: (h) => `https://linkedin.com/in/${h}` },
  facebook: { icon: SiFacebook, brandColor: '#1877F2', buildUrl: (h) => `https://facebook.com/${h}` },
  twitch: { icon: SiTwitch, brandColor: '#9146FF', buildUrl: (h) => `https://twitch.tv/${h}` },
  dribbble: { icon: SiDribbble, brandColor: '#EA4C89', buildUrl: (h) => `https://dribbble.com/${h}` },
  medium: { icon: SiMedium, brandColor: '#000000', buildUrl: (h) => `https://medium.com/@${h}` },
  devto: { icon: SiDevdotto, brandColor: '#0A0A0A', buildUrl: (h) => `https://dev.to/${h}` },
  reddit: { icon: SiReddit, brandColor: '#FF4500', buildUrl: (h) => `https://reddit.com/user/${h}` },
  pinterest: { icon: SiPinterest, brandColor: '#BD081C', buildUrl: (h) => `https://pinterest.com/${h}` },
  threads: { icon: SiThreads, brandColor: '#000000', buildUrl: (h) => `https://threads.net/@${h}` },
  bluesky: { icon: SiBluesky, brandColor: '#0085FF', buildUrl: (h) => `https://bsky.app/profile/${h}` },
  mastodon: { icon: SiMastodon, brandColor: '#6364FF', buildUrl: (h) => h },
  substack: { icon: SiSubstack, brandColor: '#FF6719', buildUrl: (h) => `https://${h}.substack.com` },
  patreon: { icon: SiPatreon, brandColor: '#FF424D', buildUrl: (h) => `https://patreon.com/${h}` },
  kofi: { icon: SiKofi, brandColor: '#FF5E5B', buildUrl: (h) => `https://ko-fi.com/${h}` },
  buymeacoffee: { icon: SiBuymeacoffee, brandColor: '#FFDD00', buildUrl: (h) => `https://buymeacoffee.com/${h}` },
  snapchat: { icon: SiSnapchat, brandColor: '#FFFC00', buildUrl: (h) => `https://snapchat.com/add/${h}` },
  discord: { icon: SiDiscord, brandColor: '#5865F2', buildUrl: (h) => h },
  telegram: { icon: SiTelegram, brandColor: '#26A5E4', buildUrl: (h) => `https://t.me/${h}` },
  whatsapp: { icon: SiWhatsapp, brandColor: '#25D366', buildUrl: (h) => `https://wa.me/${h}` },
  website: { icon: Globe, brandColor: '#6B7280', buildUrl: (h) => h.startsWith('http') ? h : `https://${h}` },
  custom: { icon: LinkIcon, brandColor: '#6B7280', buildUrl: (h) => h },
}

// Format follower count: 220430 → "220k", 1500000 → "1.5M"
const formatFollowerCount = (count: number | undefined): string => {
  if (count === undefined || count === null) return ''
  if (count < 1000) return String(count)
  if (count < 1000000) {
    const k = count / 1000
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
  }
  const m = count / 1000000
  return m >= 100 ? `${Math.round(m)}M` : `${m.toFixed(m % 1 === 0 ? 0 : 1)}M`
}


// Tilt effect hook
const useTiltEffect = (isEnabled = true) => {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !elementRef.current) return
    const rect = elementRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    const shadowX = rotateY * 1.5
    const shadowY = rotateX * -1.5
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: `${shadowX}px ${shadowY}px 25px rgba(0,0,0,0.15), 0 8px 30px rgba(0,0,0,0.1)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
      '--glare-x': `${glareX}%`,
      '--glare-y': `${glareY}%`,
    } as React.CSSProperties)
  }, [isEnabled])

  const handleMouseLeave = useCallback(() => {
    if (!isEnabled) return
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
    })
  }, [isEnabled])

  return { elementRef, tiltStyle, handleMouseMove, handleMouseLeave }
}


// Block component
const Block = ({ block }: { block: BlockData }) => {
  const { elementRef, tiltStyle, handleMouseMove, handleMouseLeave } = useTiltEffect(true)
  const [videos, setVideos] = useState(block.youtubeVideos || [])
  const [loading, setLoading] = useState(false)
  const mediaPos = block.mediaPosition || { x: 50, y: 50 }

  useEffect(() => {
    if (block.type === BlockType.SOCIAL && block.channelId && !block.youtubeVideos?.length) {
      setLoading(true)
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${block.channelId}`
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
      fetch(proxyUrl).then(r => r.text()).then(text => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        const entries = Array.from(xml.querySelectorAll('entry'))
        const vids = entries.slice(0, 4).map(e => {
          const id = e.getElementsByTagName('yt:videoId')[0]?.textContent || ''
          const title = e.getElementsByTagName('title')[0]?.textContent || ''
          return { id, title, thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg` }
        })
        if (vids.length) setVideos(vids)
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [block.channelId, block.youtubeVideos, block.type])

  const getBorderRadius = () => {
    const minDim = Math.min(block.colSpan, block.rowSpan)
    if (minDim <= 1) return '0.5rem'
    if (minDim <= 2) return '0.625rem'
    if (minDim <= 3) return '0.75rem'
    return '0.875rem'
  }
  const borderRadius = getBorderRadius()

  const gridStyle: React.CSSProperties = {}
  if (block.gridColumn !== undefined) {
    gridStyle.gridColumnStart = block.gridColumn
    gridStyle.gridColumnEnd = block.gridColumn + block.colSpan
  }
  if (block.gridRow !== undefined) {
    gridStyle.gridRowStart = block.gridRow
    gridStyle.gridRowEnd = block.gridRow + block.rowSpan
  }

  const handleClick = () => {
    let url = block.content
    if (block.type === BlockType.SOCIAL && block.socialPlatform && block.socialHandle) {
      url = SOCIAL_PLATFORMS[block.socialPlatform]?.buildUrl(block.socialHandle)
    } else if (block.channelId) {
      url = `https://youtube.com/channel/${block.channelId}`
    }
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const isYoutube = block.type === BlockType.SOCIAL && block.channelId
  const activeVideoId = block.youtubeVideoId || videos[0]?.id
  const isRichYT = isYoutube && activeVideoId && block.youtubeMode !== 'grid' && block.youtubeMode !== 'list'
  const isYTGrid = isYoutube && (block.youtubeMode === 'grid' || block.youtubeMode === 'list')
  const resolvedImageUrl = resolveAssetUrl(block.imageUrl)
  const isLinkImg = block.type === BlockType.LINK && resolvedImageUrl

  if (block.type === BlockType.SPACER) return <div style={{ borderRadius, ...gridStyle }} className="h-full" />

  if (block.type === BlockType.SOCIAL_ICON) {
    const platform = SOCIAL_PLATFORMS[block.socialPlatform || 'custom']
    const Icon = platform?.icon
    const url = block.socialHandle ? platform?.buildUrl(block.socialHandle) : ''
    return (
      <a href={url || undefined} target="_blank" rel="noopener noreferrer" onClick={handleClick}
        className={`bento-item relative h-full ${block.color || 'bg-white'} flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md transition-all`}
        style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}>
        {Icon && <span style={{ color: platform.brandColor }}><Icon size={24} /></span>}
      </a>
    )
  }

  if (isYTGrid) {
    return (
      <div onClick={handleClick} style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}
        className={`bento-item group cursor-pointer h-full ${block.color || 'bg-white'} ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all`}>
        <div className="w-full h-full flex flex-col p-2 md:p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center"><Youtube size={12} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{block.channelTitle || 'YouTube'}</h3>
              <span className="text-[8px] text-gray-400">Latest videos</span>
            </div>
          </div>
          {loading ? <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={16} /></div> : (
            <div className="flex-1 grid grid-cols-2 gap-1 overflow-hidden">
              {videos.slice(0, 4).map((v, i) => (
                <a key={i} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="relative overflow-hidden rounded bg-gray-100 group/vid">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover/vid:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                      <Play size={10} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  let bgStyle: React.CSSProperties = block.customBackground ? { background: block.customBackground } : {}
  if (isRichYT) bgStyle = { backgroundImage: `url(https://img.youtube.com/vi/${activeVideoId}/maxresdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
  else if (isLinkImg && resolvedImageUrl) bgStyle = { backgroundImage: `url(${resolvedImageUrl})`, backgroundSize: 'cover', backgroundPosition: `${mediaPos.x}% ${mediaPos.y}%` }

  return (
    <div onClick={handleClick} style={{ ...gridStyle }} className="cursor-pointer h-full transform-gpu">
      <div ref={elementRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        style={{ ...bgStyle, borderRadius, ...tiltStyle, width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        className={`bento-item group relative overflow-hidden w-full h-full ${!block.customBackground && !isLinkImg && !isRichYT ? (block.color || 'bg-white') : ''} ${block.textColor || 'text-gray-900'} ring-1 ring-black/5 shadow-sm transition-all`}>
        <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.25) 0%, transparent 60%)' }} />
        {(isRichYT || isLinkImg) && (block.title || block.subtext) && (
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-0" />
        )}
        <div className="w-full h-full relative z-10">
          {block.type === BlockType.MEDIA && resolvedImageUrl ? (
            <div className="w-full h-full relative overflow-hidden">
              {/\.(mp4|webm|ogg|mov)$/i.test(resolvedImageUrl) ? (
                <video src={resolvedImageUrl} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} autoPlay loop muted playsInline />
              ) : (
                <img src={resolvedImageUrl} alt={block.title || ''} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} />
              )}
              {block.title && <div className="media-overlay"><p className="media-title text-sm">{block.title}</p>{block.subtext && <p className="media-subtext">{block.subtext}</p>}</div>}
            </div>
          ) : block.type === BlockType.MAP ? (
            <div className="w-full h-full relative bg-gray-100 overflow-hidden">
              <iframe width="100%" height="100%" className="opacity-95 grayscale-[20%] group-hover:grayscale-0 transition-all"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(block.content || 'Paris')}&t=&z=13&ie=UTF8&iwloc=&output=embed`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
              {block.title && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"><p className="font-semibold text-white text-sm">{block.title}</p></div>}
            </div>
          ) : isRichYT ? (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={16} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
              {(block.channelTitle || block.title) && <div className="absolute bottom-0 left-0 right-0 p-3"><h3 className="font-semibold text-white text-sm drop-shadow-lg">{block.channelTitle || block.title}</h3></div>}
            </div>
          ) : (
            <div className="p-3 h-full flex flex-col justify-between">
              {block.type === BlockType.SOCIAL && block.socialPlatform && (() => {
                const platform = SOCIAL_PLATFORMS[block.socialPlatform]
                const Icon = platform?.icon
                return Icon ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${block.textColor === 'text-white' || isLinkImg ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}`}
                    style={{ color: block.textColor === 'text-brand' ? platform.brandColor : undefined }}>
                    <Icon size={14} />
                  </div>
                ) : null
              })()}
              <div className={block.type === BlockType.TEXT ? 'flex flex-col justify-center h-full' : 'mt-auto'}>
                <h3 className={`font-bold leading-tight ${isLinkImg ? 'text-white drop-shadow-lg' : ''}`}>{block.title}</h3>
                {block.subtext && <p className={`text-xs mt-1 ${isLinkImg ? 'text-white/80' : 'opacity-60'}`}>{block.subtext}</p>}
                {block.type === BlockType.TEXT && block.content && <p className="opacity-70 mt-2 text-sm whitespace-pre-wrap">{block.content}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Profile data
const profile = {"name":"abdalem","bio":"Software Engineering, Applied Technologies & AI Automation | Founder of Abbi Digital | Co-Founder of WeBIA | Building aBeeCRM, Leyth AI & Silya","avatarUrl":"/assets/avatar.png","theme":"light","primaryColor":"blue","showBranding":false,"analytics":{"enabled":false,"supabaseUrl":""},"socialAccounts":[],"openGraph":{"description":"Founder & CEO of Abbi Digital and Co-Founder of WeBIA, I build and structure digital products, applied technology solutions and AI-driven automations. ","twitterHandle":"abdalem","siteName":"Abdennour ALEM","title":"Abdennour ALEM, ","twitterCardType":"summary_large_image","image":"data:image/jpeg;base64,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"}}
const blocks: BlockData[] = [{"id":"bento_1776884677911_0n0a4o1ib","type":"LINK","title":"Abbi Digital","subtext":"The core agency for your tech and marketing needs","content":"https://abbi.digital","colSpan":4,"rowSpan":4,"gridColumn":1,"gridRow":1,"color":"bg-blue-500","textColor":"text-white","imageUrl":"/assets/block-bento_1776884677911_0n0a4o1ib.png","zIndex":1,"mediaPosition":{"x":59.218037788666265,"y":17.14285714285714}},{"id":"t1ny2wo9c","type":"LINK","title":"WeBIA","content":"","colSpan":2,"rowSpan":4,"color":"bg-white","textColor":"text-gray-900","gridColumn":5,"gridRow":1,"subtext":"We Believe In Algeria. The ecosystem that connect algerians no matter where they can be found","imageUrl":"/assets/block-t1ny2wo9c.png"},{"id":"bor93hfpv","type":"SOCIAL","title":"X","content":"https://x.com/abdalem25","colSpan":1,"rowSpan":2,"color":"bg-gray-900","textColor":"text-white","gridColumn":1,"gridRow":5,"socialPlatform":"x","socialHandle":"abdalem25","subtext":"@abdalem25"},{"id":"39r8xd8q7","type":"SOCIAL","title":"Instagram","content":"https://www.instagram.com/abdalem_/","colSpan":1,"rowSpan":2,"color":"bg-red-500","textColor":"text-white","gridColumn":2,"gridRow":5,"socialPlatform":"instagram","socialHandle":"abdalem_","subtext":"@abdalem_"},{"id":"kk1601p62","type":"SOCIAL","title":"TikTok","content":"https://www.tiktok.com/@abdalem25","colSpan":2,"rowSpan":2,"color":"bg-gray-900","textColor":"text-white","gridColumn":3,"gridRow":5,"socialPlatform":"tiktok","socialHandle":"abdalem25","subtext":"@abdalem25"},{"id":"23e1ip41z","type":"SOCIAL","title":"LinkedIn","content":"https://www.linkedin.com/in/abdalem/","colSpan":2,"rowSpan":2,"color":"bg-blue-500","textColor":"text-white","gridColumn":5,"gridRow":5,"socialPlatform":"linkedin","socialHandle":"abdalem","subtext":"abdalem"},{"id":"t3gh1e73n","type":"SOCIAL","title":"WhatsApp","content":"https://wa.me/%2B33652386624","colSpan":1,"rowSpan":2,"color":"bg-emerald-500","textColor":"text-white","gridColumn":1,"gridRow":7,"socialPlatform":"whatsapp","socialHandle":"+33652386624","subtext":"+33652386624"},{"id":"bco53c6va","type":"SOCIAL","title":"GitHub","content":"https://github.com/abdalem","colSpan":2,"rowSpan":2,"color":"bg-gray-100","textColor":"text-gray-900","gridColumn":2,"gridRow":7,"socialPlatform":"github","socialHandle":"abdalem","subtext":"@abdalem"},{"id":"tu8iky9r1","type":"SOCIAL","title":"Discord","content":"https://discord.gg/abdalem","colSpan":1,"rowSpan":2,"color":"bg-violet-500","textColor":"text-white","gridColumn":4,"gridRow":7,"socialPlatform":"discord","socialHandle":"abdalem","subtext":"abdalem"},{"id":"0tci598t4","type":"LINK","title":"aBeeCRM","content":"https://abeecrm.com/","colSpan":1,"rowSpan":2,"color":"bg-violet-500","textColor":"text-white","gridColumn":5,"gridRow":7,"subtext":"The modular CRM"},{"id":"xka5zh5k4","type":"LINK","title":"Sylia","content":"https://sylia.app","colSpan":1,"rowSpan":1,"color":"bg-white","textColor":"text-gray-900","gridColumn":6,"gridRow":7,"subtext":"The link ecosytem for building community "},{"id":"ono9s44hz","type":"LINK","title":"Leyth","content":"https://leyth.ai","colSpan":1,"rowSpan":1,"color":"bg-white","textColor":"text-gray-900","gridColumn":6,"gridRow":8,"subtext":"Your ai life and business coach"}]

// Analytics hook (uses Edge Function - no API keys exposed)
const useAnalytics = () => {
  const sessionStart = useRef(Date.now())
  const maxScroll = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      maxScroll.current = Math.max(maxScroll.current, scrollPercent)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const config = profile.analytics
    if (!config?.enabled || !config?.supabaseUrl) return

    const track = async (eventType: 'page_view' | 'click', extra: { blockId?: string; destinationUrl?: string } = {}) => {
      const utm = new URLSearchParams(window.location.search)
      const payload = {
        siteId: '',
        event: eventType,
        blockId: extra.blockId,
        destinationUrl: extra.destinationUrl,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        utm: {
          source: utm.get('utm_source') || undefined,
          medium: utm.get('utm_medium') || undefined,
          campaign: utm.get('utm_campaign') || undefined,
          term: utm.get('utm_term') || undefined,
          content: utm.get('utm_content') || undefined,
        },
        language: navigator.language,
        screenW: window.screen?.width,
        screenH: window.screen?.height,
      }
      // Use Edge Function endpoint (secure - no API keys needed)
      const endpoint = config.supabaseUrl.replace(/\/+$/, '') + '/functions/v1/openbento-analytics-track'
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }

    track('page_view')

    // Note: session_end is not supported by the Edge Function, only page_view and click
    // If you need session tracking, extend the Edge Function
  }, [])
}


// Mobile layout helper - calculates responsive grid spans
const getMobileLayout = (block: BlockData) => ({
  colSpan: block.colSpan >= 5 ? 2 : 1,
  rowSpan: block.colSpan >= 3 && block.colSpan < 5 ? Math.max(block.rowSpan, 2) : block.rowSpan
})

// Sort blocks for mobile
const sortedBlocks = [...blocks].sort((a, b) => {
  const aRow = a.gridRow ?? 999
  const bRow = b.gridRow ?? 999
  const aCol = a.gridColumn ?? 999
  const bCol = b.gridColumn ?? 999
  if (aRow !== bRow) return aRow - bRow
  return aCol - bCol
})

export default function App() {
  useAnalytics()

  const avatarStyle = { borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '4px solid #ffffff' }
  const bgStyle: React.CSSProperties = { backgroundColor: '#f8fafc' }
  const avatarUrl = resolveAssetUrl(profile.avatarUrl)

  return (
    <div className="min-h-screen font-sans" style={bgStyle}>
      
      <div className="relative z-10">

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <div className="fixed left-0 top-0 w-[420px] h-screen flex flex-col justify-center items-start px-12">
            <div className="w-40 h-40 overflow-hidden bg-gray-100 mb-8" style={avatarStyle}>
              <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">{profile.name}</h1>
            <p className="text-base text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
          </div>
          <div className="ml-[420px] flex-1 p-12">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gridAutoRows: '64px' }}>
              {blocks.map(block => <Block key={block.id} block={block} />)}
            </div>
          </div>
        </div>


        {/* Mobile Layout - 2 columns adaptive */}
        <div className="lg:hidden">
          <div className="p-4 pt-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 overflow-hidden bg-gray-100" style={avatarStyle}>
              <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-sm text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
          </div>
          <div className="p-4">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '80px', gap: '12px' }}>
              {sortedBlocks.map(block => {
                const mobile = getMobileLayout(block)
                return (
                  <div key={block.id} style={{ gridColumn: `span ${mobile.colSpan}`, gridRow: `span ${mobile.rowSpan}` }}>
                    <Block block={{ ...block, gridColumn: undefined, gridRow: undefined }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
