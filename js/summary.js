/**
 * File: js/summary.js
 * Hệ thống Từ Điển & Tìm Kiếm Chính Xác Cao (Precision Search & Dictionary Ordering):
 * - Chấm điểm độ khớp 5 bậc (Exact ➔ Segment ➔ Prefix ➔ Whole-Word Token ➔ Fuzzy) & cắt nhiễu tự động
 * - Nhận diện thông minh Tiếng Việt có dấu / không dấu, Ranh giới từ (Word Boundary), Kanji, Kana & Romaji
 * - Duyệt & Tra cứu theo Thứ Tự Từ Điển:
 *   1. Từ điển Tiếng Việt (A ➔ Y)
 *   2. Từ điển Tiếng Nhật (Bảng 50 âm あ ➔ わ + chi tiết từng âm)
 *   3. Từ điển Âm Hán-Việt (A ➔ Y)
 *   4. Theo Thứ Tự Bài Học
 */

let allVocabList = [];
let currentFilteredList = [];

// Trạng thái bộ lọc Từ điển & Tìm kiếm
let currentDictOrderMode = 'vn_az';       // 'vn_az' | 'jp_50' | 'hv_az' | 'chapter'
let currentDictLetter = 'all';            // 'all' | 'A'..'Y' | 'あ'..'わ'
let currentDictSubKana = 'all';           // 'all' | 'か'..'こ'...
let searchPrecisionMode = 'exact';        // 'exact' (Chính xác - mặc định) | 'broad' (Mở rộng)
let isDictionaryFullscreen = false;

// ==========================================================================
// 1. BẢNG MÃ CHUYỂN ĐỔI KANA <-> ROMAJI & CHUẨN HÓA NGÔN NGỮ
// ==========================================================================

const KANA_TO_ROMAJI_MAP = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho', 'しぇ': 'she',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho', 'ちぇ': 'che',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo', 'じぇ': 'je',
    'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',

    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho', 'シェ': 'she',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho', 'チェ': 'che',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo', 'ジェ': 'je',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
    'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo', 'フュ': 'fyu',
    'ティ': 'ti', 'ディ': 'di', 'トゥ': 'tu', 'ドゥ': 'du',
    'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
    'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
    'ツァ': 'tsa', 'ツィ': 'tsi', 'ツェ': 'tse', 'ツォ': 'tso',

    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',

    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
};

const ROMAJI_TO_HIRAGANA_DICT = {
    'tsu': 'つ', 'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
    'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ', 'she': 'しぇ',
    'sya': 'しゃ', 'syu': 'しゅ', 'syo': 'しょ',
    'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ', 'che': 'ちぇ',
    'tya': 'ちゃ', 'tyu': 'ちゅ', 'tyo': 'ちょ',
    'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
    'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
    'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
    'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
    'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
    'zya': 'じゃ', 'zyu': 'じゅ', 'zyo': 'じょ',
    'dya': 'じゃ', 'dyu': 'じゅ', 'dyo': 'じょ',
    'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
    'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
    'shi': 'し', 'chi': 'ち',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'ti': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wo': 'を',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'zi': 'じ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
    'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
    'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
    'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ', 'je': 'じぇ',
    'fa': 'ふぁ', 'fi': 'ふぃ', 'fe': 'ふぇ', 'fo': 'ふぉ',
    'nn': 'ん',
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お', 'n': 'ん'
};

const SORTED_ROMAJI_KEYS = Object.keys(ROMAJI_TO_HIRAGANA_DICT).sort((a, b) => b.length - a.length);

// Cấu hình Bảng 50 âm (Gojūon) chuẩn từ điển Nhật
const GOJUON_ROWS_CONFIG = [
    { row: 'あ', label: 'あ (A)', cols: ['あ', 'い', 'う', 'え', 'お'] },
    { row: 'か', label: 'か (Ka)', cols: ['か', 'き', 'く', 'け', 'こ'] },
    { row: 'さ', label: 'さ (Sa)', cols: ['さ', 'し', 'す', 'せ', 'そ'] },
    { row: 'た', label: 'た (Ta)', cols: ['た', 'ち', 'つ', 'て', 'と'] },
    { row: 'な', label: 'な (Na)', cols: ['な', 'に', 'ぬ', 'ね', 'の'] },
    { row: 'は', label: 'は (Ha)', cols: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
    { row: 'ま', label: 'ま (Ma)', cols: ['ま', 'み', 'む', 'め', 'も'] },
    { row: 'や', label: 'や (Ya)', cols: ['や', 'ゆ', 'よ'] },
    { row: 'ら', label: 'ら (Ra)', cols: ['ら', 'り', 'る', 'れ', 'ろ'] },
    { row: 'わ', label: 'わ (Wa)', cols: ['わ', 'を', 'ん'] }
];

const VN_ALPHABET_LIST = ['A', 'B', 'C', 'D', 'Đ', 'E', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y'];

const HIRA_BASE_CHAR_MAP = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'ゔ': 'う',
    'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'っ': 'つ', 'で': 'て', 'ど': 'と',
    'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
    'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ'
};

const HIRA_CHAR_TO_ROW = {};
GOJUON_ROWS_CONFIG.forEach(r => {
    r.cols.forEach(c => {
        HIRA_CHAR_TO_ROW[c] = r.row;
    });
});

function kanaToRomaji(str) {
    if (!str) return '';
    let res = '';
    let i = 0;
    while (i < str.length) {
        const twoChar = str.slice(i, i + 2);
        if (KANA_TO_ROMAJI_MAP[twoChar]) {
            res += KANA_TO_ROMAJI_MAP[twoChar];
            i += 2;
            continue;
        }
        const oneChar = str[i];
        if (oneChar === 'っ' || oneChar === 'ッ') {
            const nextTwo = str.slice(i + 1, i + 3);
            const nextChar = str[i + 1];
            const nextRomaji = KANA_TO_ROMAJI_MAP[nextTwo] || KANA_TO_ROMAJI_MAP[nextChar];
            if (nextRomaji) res += nextRomaji[0];
            i++;
            continue;
        }
        if (oneChar === 'ー') {
            if (res.length > 0) {
                const last = res[res.length - 1];
                if (['a', 'i', 'u', 'e', 'o'].includes(last)) res += last;
            }
            i++;
            continue;
        }
        res += KANA_TO_ROMAJI_MAP[oneChar] || oneChar;
        i++;
    }
    return res;
}

function romajiToHiragana(text) {
    if (!text) return '';
    let str = text.toLowerCase();
    str = str.replace(/([bcdfghjklmpqrstvwxyz])\1/g, (m, p1) => (p1 === 'n' ? 'nn' : 'っ' + p1));
    str = str.replace(/tc(?=h[auoie])/g, 'っ');
    let result = '';
    let i = 0;
    while (i < str.length) {
        if (str[i] === 'っ') {
            result += 'っ';
            i++;
            continue;
        }
        let matched = false;
        for (const k of SORTED_ROMAJI_KEYS) {
            if (str.startsWith(k, i)) {
                if (k === 'n' && i + 1 < str.length && ['a', 'i', 'u', 'e', 'o', 'y'].includes(str[i + 1])) {
                    continue;
                }
                result += ROMAJI_TO_HIRAGANA_DICT[k];
                i += k.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += str[i];
            i++;
        }
    }
    return result;
}

function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

function katakanaToHiragana(str) {
    if (!str) return '';
    return str.replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function removeVietnameseTones(str) {
    if (!str) return '';
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase();
}

function hasVietnameseDiacritics(str) {
    if (!str) return false;
    return /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(str);
}

function hasJapaneseCharacters(str) {
    if (!str) return false;
    return /[\u3040-\u30ff\u3400-\u9faf]/.test(str);
}

function normalizeFuzzyRomaji(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/ou/g, 'o')
        .replace(/oo/g, 'o')
        .replace(/uu/g, 'u')
        .replace(/ii/g, 'i')
        .replace(/ee/g, 'e')
        .replace(/aa/g, 'a')
        .replace(/chi/g, 'ti')
        .replace(/shi/g, 'si')
        .replace(/tsu/g, 'tu')
        .replace(/fu/g, 'hu')
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Tách một chuỗi tiếng Việt thành mảng các từ đơn độc lập (tokens) và các vế nghĩa (segments)
 */
function tokenizeVietnameseText(text) {
    if (!text) return { clean: '', segments: [], tokens: [] };
    // Bỏ phần ghi chú phụ trong ngoặc đơn để lấy nghĩa cốt lõi chính xác
    const withoutParen = text.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
    const clean = withoutParen
        .toLowerCase()
        .replace(/^[~～\-\s\d\.]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

    const rawSegments = withoutParen
        .toLowerCase()
        .split(/[,;/・\n]+/)
        .map(s => s.replace(/^[~～\-\s]+|[~～\-\s\?\.!]+$/g, '').trim())
        .filter(Boolean);

    const tokenSet = new Set();
    text.toLowerCase()
        .split(/[\s,;/\(\)\[\]\.\-\?\!~～・"':]+/)
        .filter(Boolean)
        .forEach(t => tokenSet.add(t));

    return {
        clean: clean || text.toLowerCase().trim(),
        segments: rawSegments.length > 0 ? rawSegments : [clean],
        tokens: Array.from(tokenSet)
    };
}

/**
 * Xác định chữ cái đầu chuẩn Tiếng Việt (A..Y, tách riêng D và Đ)
 */
function extractVietnameseInitial(str) {
    if (!str) return '#';
    const cleaned = str.replace(/^[^a-zA-ZÀ-ỹđĐ]+/, '').trim();
    if (!cleaned) return '#';
    const firstChar = cleaned[0].toUpperCase();
    if (firstChar === 'Đ' || firstChar === 'đ') return 'Đ';
    const base = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (base >= 'A' && base <= 'Z') return base;
    return '#';
}

/**
 * Trích xuất âm đọc Hiragana chuẩn và phân loại vào Hàng / Cột trong Bảng 50 âm (Gojūon)
 */
function extractGojuonInfo(jpVal, isKanjiLesson, isKanji) {
    if (isKanji) {
        return { hiraReading: '', row: '', col: '', romaji: '' };
    }
    let rawKana = '';
    if (isKanjiLesson) {
        rawKana = jpVal || '';
    } else if (jpVal) {
        const parenMatch = jpVal.match(/\(([^)]+)\)/);
        rawKana = parenMatch ? parenMatch[1] : jpVal;
    }

    // Làm sạch các ký tự không phải chữ Kana ở đầu chuỗi (VD: ～, ~, お, ご...)
    const hiraFull = katakanaToHiragana(rawKana)
        .replace(/^[~～\s・\(\)N]+/, '')
        .trim();

    // Tìm ký tự Hiragana đầu tiên
    const firstHiraMatch = hiraFull.match(/[\u3041-\u3096]/);
    if (!firstHiraMatch) {
        return { hiraReading: hiraFull, row: '', col: '', romaji: kanaToRomaji(hiraFull).trim() };
    }

    const firstChar = firstHiraMatch[0];
    const baseCol = HIRA_BASE_CHAR_MAP[firstChar] || firstChar;
    const row = HIRA_CHAR_TO_ROW[baseCol] || '';

    return {
        hiraReading: hiraFull,
        row,
        col: baseCol,
        romaji: kanaToRomaji(hiraFull).trim()
    };
}

// ==========================================================================
// 2. TỔNG HỢP & INDEX DỮ LIỆU TỪ VỰNG
// ==========================================================================

let renderedVocabCount = 0;
const VOCAB_PAGE_SIZE = 70;
let searchDebounceTimer = null;
let isOverlayGesture = false;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function createVocabItem(chapterId, chapterLabel, chapterTitle, vnKey, jpVal, options = {}) {
    const isKanjiLesson = !!options.isKanjiLesson;
    const isKanji = !!options.isKanji;
    const meta = (isKanjiLesson && typeof KANJI_LESSON_META !== 'undefined') ? KANJI_LESSON_META[vnKey] : null;
    const radicalInfo = (isKanji && typeof getKanjiRadicalTagInfo === 'function') ? getKanjiRadicalTagInfo(jpVal) : null;

    // 1. Phân tách rõ Nghĩa Tiếng Việt & Âm Hán-Việt (Không gộp tên bộ thủ phụ để tránh nhiễu tìm kiếm)
    let meaningText = vnKey;
    let hanVietText = '';
    let jpSurface = jpVal;

    if (isKanjiLesson) {
        jpSurface = vnKey; // Mặt chữ Hán của từ vựng Kanji
        meaningText = meta ? meta.nghia : jpVal;
        hanVietText = meta ? meta.hanViet : '';
    } else if (isKanji) {
        jpSurface = jpVal;
        if (typeof parseKanjiLabel === 'function') {
            const parsed = parseKanjiLabel(vnKey);
            hanVietText = parsed.hanViet || '';
            meaningText = parsed.meaning || parsed.hanViet || vnKey;
        }
    } else {
        jpSurface = jpVal.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    const vnParsed = tokenizeVietnameseText(meaningText);
    const vnNoToneParsed = tokenizeVietnameseText(removeVietnameseTones(meaningText));

    const hanVietLower = hanVietText.toLowerCase().trim();
    const hanVietNoTone = removeVietnameseTones(hanVietLower);
    const hanVietTokens = hanVietNoTone.split(/[\s,;/・\-]+/).filter(Boolean);

    const gojuon = extractGojuonInfo(jpVal, isKanjiLesson, isKanji);
    const romajiLower = gojuon.romaji.toLowerCase();
    const romajiClean = romajiLower.replace(/[^a-z0-9]/g, '');
    const romajiTokens = romajiLower.split(/[\s,;/・\-\(\)\?\.!~～]+/).filter(Boolean);

    const vnInitial = extractVietnameseInitial(vnParsed.clean || meaningText);
    const hanVietInitial = hanVietText ? extractVietnameseInitial(hanVietText) : '';

    return {
        chapterId,
        chapterLabel,
        chapterTitle,
        isKanji,
        kanjiGroupId: options.kanjiGroupId || null,
        isKanjiLesson,
        meta,
        radicalInfo,
        vn: vnKey,
        jp: jpVal,
        jpSurface,
        jpSurfaceLower: jpSurface.toLowerCase(),
        meaningText,
        hanVietText,
        hanVietLower,
        hanVietNoTone,
        hanVietTokens,
        hanVietInitial,
        vnMainLower: vnParsed.clean,
        vnMainNoTone: vnNoToneParsed.clean,
        vnSegmentsLower: vnParsed.segments,
        vnSegmentsNoTone: vnNoToneParsed.segments,
        vnTokensLower: vnParsed.tokens,
        vnTokensNoTone: vnNoToneParsed.tokens,
        vnFullLower: meaningText.toLowerCase(),
        vnFullNoTone: removeVietnameseTones(meaningText),
        vnInitial,
        vnSortKey: (vnParsed.clean || meaningText).toLowerCase(),
        hiraReading: gojuon.hiraReading,
        jpGojuonRow: gojuon.row,
        jpGojuonCol: gojuon.col,
        romaji: gojuon.romaji,
        romajiLower,
        romajiClean,
        romajiTokens,
        romajiNorm: normalizeFuzzyRomaji(gojuon.romaji)
    };
}

function getAggregateVocabData() {
    const list = [];

    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.skipInSummary) return;
        if (chapter.id === 'dem') {
            if (typeof generateMixedCounters === 'function') {
                const counters = generateMixedCounters(10);
                for (let vnKey in counters) {
                    list.push(createVocabItem('dem', 'Đếm số', 'Luyện đếm số', vnKey, counters[vnKey]));
                }
            }
        } else if (chapter.isKanjiPageGroup && Array.isArray(chapter.pagesConfig)) {
            chapter.pagesConfig.forEach(p => {
                const pData = p.getData ? p.getData() : null;
                if (pData) {
                    for (let vnKey in pData) {
                        list.push(createVocabItem(p.id, p.shortName, `${p.shortName} - ${p.title}`, vnKey, pData[vnKey], {
                            isKanji: true,
                            kanjiGroupId: chapter.id
                        }));
                    }
                }
            });
        } else if (chapter.isKanjiLessonGroup && typeof KANJI_LESSONS_CONFIG !== 'undefined') {
            KANJI_LESSONS_CONFIG.forEach(l => {
                const lData = l.getData ? l.getData() : null;
                if (lData) {
                    for (let vnKey in lData) {
                        list.push(createVocabItem(l.id, l.shortName, `${l.shortName} - ${l.title}`, vnKey, lData[vnKey], { isKanjiLesson: true }));
                    }
                }
            });
        } else {
            const data = chapter.getAllData
                ? chapter.getAllData()
                : (chapter.getData ? chapter.getData() : null);
            if (data) {
                const chapterTitle = chapter.title.toLowerCase().startsWith(chapter.label.toLowerCase())
                    ? chapter.title
                    : `${chapter.label} - ${chapter.title}`;
                for (let vnKey in data) {
                    list.push(createVocabItem(chapter.id, chapter.label, chapterTitle, vnKey, data[vnKey]));
                }
            }
        }
    });

    return list;
}

// ==========================================================================
// 3. THUẬT TOÁN CHẤM ĐIỂM ĐỘ KHỚP 5 BẬC & CẮT NHIỄU TỰ ĐỘNG
// ==========================================================================

/**
 * Kiểm tra xem cụm từ queryPhrase có xuất hiện theo đúng ranh giới từ độc lập trong targetText không
 */
function hasWholePhraseMatch(targetText, queryPhrase) {
    if (!targetText || !queryPhrase) return false;
    if (targetText === queryPhrase) return true;
    const escaped = queryPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;/\\(\\)\\[\\]\\.\\-\\?\\!~～・"':])${escaped}(?:$|[\\s,;/\\(\\)\\[\\]\\.\\-\\?\\!~～・"':])`, 'i');
    return regex.test(targetText);
}

/**
 * Chấm điểm mức độ khớp của 1 mục từ vựng với truy vấn tìm kiếm (0 = Không khớp / Loại bỏ)
 */
function scoreVocabSearchMatch(item, qCtx) {
    const {
        qRaw, qLower, qNoSpaces, qNoTone, qNoToneWords, qWords,
        hasDiacritics, isJapanese, qHira, qKata, qRomajiNorm, isBroad
    } = qCtx;

    const lenPenalty = Math.min(40, Math.floor((item.vnMainLower.length || 0) * 0.8));

    // TRƯỜNG HỢP 1: Người dùng gõ trực tiếp chữ Nhật (Kanji / Hiragana / Katakana)
    if (isJapanese) {
        if (item.jpSurface === qRaw || item.hiraReading === qRaw || item.jp === qRaw) {
            return 1000;
        }
        if (item.jpSurface.startsWith(qRaw) || item.hiraReading.startsWith(qRaw)) {
            return 880 - Math.min(30, item.jpSurface.length * 2);
        }
        if (item.jp.includes(qRaw) || (qHira && item.hiraReading.includes(qHira))) {
            return 680 - Math.min(30, item.jp.length);
        }
        return 0;
    }

    // TRƯỜNG HỢP 2: Người dùng gõ Tiếng Việt CÓ DẤU -> Khớp nghiêm ngặt có dấu & ranh giới từ
    if (hasDiacritics) {
        // Bậc 1: Trùng khớp hoàn toàn
        if (item.vnMainLower === qLower || item.hanVietLower === qLower || item.vnFullLower === qLower) {
            return 1000;
        }
        // Bậc 2: Trùng khít 1 vế nghĩa chính (VD: gõ "vở" khớp "vở, quyển vở")
        if (item.vnSegmentsLower.includes(qLower)) {
            return 930 - lenPenalty;
        }
        // Bậc 3: Bắt đầu ngay đầu vế nghĩa theo đúng ranh giới từ
        for (const seg of item.vnSegmentsLower) {
            if (seg.startsWith(qLower + ' ')) {
                return 820 - lenPenalty;
            }
        }
        if (item.hanVietLower && (item.hanVietLower === qLower || item.hanVietLower.startsWith(qLower + ' '))) {
            return 810 - lenPenalty;
        }
        // Bậc 4: Chứa trọn vẹn cụm từ khóa theo đúng ranh giới từ độc lập
        const allTokensMatched = qWords.every(w => item.vnTokensLower.includes(w));
        if (allTokensMatched && hasWholePhraseMatch(item.vnFullLower, qLower)) {
            return 660 - lenPenalty;
        }
        if (item.hanVietLower && hasWholePhraseMatch(item.hanVietLower, qLower)) {
            return 650 - lenPenalty;
        }
        if (allTokensMatched && qWords.length > 1) {
            return 560 - lenPenalty;
        }
        // Bậc 5: Chỉ khi người dùng bật chế độ "Mở rộng" mới cho khớp chuỗi con
        if (isBroad && (item.vnFullLower.includes(qLower) || item.hanVietLower.includes(qLower))) {
            return 300 - lenPenalty;
        }
        return 0;
    }

    // TRƯỜNG HỢP 3: Người dùng gõ chữ cái Latin KHÔNG DẤU (Romaji hoặc Tiếng Việt không dấu)
    let bestScore = 0;

    // 3A. Kiểm tra khớp với Romaji / Kana chuyển đổi
    if (qNoSpaces.length >= 2) {
        if (item.romajiClean === qNoSpaces || item.romajiLower === qLower) {
            bestScore = Math.max(bestScore, 1000);
        } else if (item.romajiTokens.includes(qNoSpaces)) {
            bestScore = Math.max(bestScore, 910 - Math.min(30, item.romajiClean.length));
        } else if (qHira && (item.hiraReading === qHira || item.jpSurface === qHira || item.jpSurface === qKata)) {
            bestScore = Math.max(bestScore, 980);
        } else if (qNoSpaces.length >= 3 && item.romajiClean.startsWith(qNoSpaces)) {
            bestScore = Math.max(bestScore, 790 - Math.min(35, item.romajiClean.length));
        } else if (isBroad && qNoSpaces.length >= 3 && (item.romajiClean.includes(qNoSpaces) || (qRomajiNorm && item.romajiNorm.includes(qRomajiNorm)))) {
            bestScore = Math.max(bestScore, 340 - Math.min(30, item.romajiClean.length));
        }
    }

    // 3B. Kiểm tra khớp với Tiếng Việt không dấu & Âm Hán-Việt không dấu (theo ranh giới từ!)
    if (item.vnMainNoTone === qNoTone || (item.hanVietNoTone && item.hanVietNoTone === qNoTone)) {
        bestScore = Math.max(bestScore, 990);
    } else if (item.vnSegmentsNoTone.includes(qNoTone) || item.hanVietTokens.includes(qNoTone)) {
        bestScore = Math.max(bestScore, 915 - lenPenalty);
    } else {
        for (const seg of item.vnSegmentsNoTone) {
            if (seg.startsWith(qNoTone + ' ')) {
                bestScore = Math.max(bestScore, 800 - lenPenalty);
                break;
            }
        }
        if (item.hanVietNoTone && item.hanVietNoTone.startsWith(qNoTone + ' ')) {
            bestScore = Math.max(bestScore, 795 - lenPenalty);
        }

        const allNoToneTokens = qNoToneWords.every(w => item.vnTokensNoTone.includes(w) || item.hanVietTokens.includes(w));
        if (allNoToneTokens && (hasWholePhraseMatch(item.vnFullNoTone, qNoTone) || hasWholePhraseMatch(item.hanVietNoTone, qNoTone))) {
            bestScore = Math.max(bestScore, 640 - lenPenalty);
        } else if (allNoToneTokens && qNoToneWords.length > 1) {
            bestScore = Math.max(bestScore, 550 - lenPenalty);
        } else if (isBroad && qNoTone.length >= 2 && (item.vnFullNoTone.includes(qNoTone) || item.hanVietNoTone.includes(qNoTone))) {
            bestScore = Math.max(bestScore, 290 - lenPenalty);
        }
    }

    return bestScore;
}

// ==========================================================================
// 4. SẮP XẾP & LỌC THEO THỨ TỰ TỪ ĐIỂN (A-Z / 50 ÂM あ-わ / HÁN-VIỆT)
// ==========================================================================

function setDictionaryOrderMode(mode) {
    currentDictOrderMode = mode;
    currentDictLetter = 'all';
    currentDictSubKana = 'all';

    ['vn_az', 'jp_50', 'hv_az', 'chapter'].forEach(m => {
        document.getElementById(`dict-mode-btn-${m}`)?.classList.toggle('active', m === mode);
    });

    renderDictionaryIndexBar();
    filterVocabTable(true);
}

function setDictionaryLetterFilter(letter) {
    currentDictLetter = letter;
    currentDictSubKana = 'all';
    renderDictionaryIndexBar();
    filterVocabTable(true);
}

function setDictionarySubKanaFilter(colKana) {
    currentDictSubKana = colKana;
    renderDictionaryIndexBar();
    filterVocabTable(true);
}

function setSearchPrecisionMode(mode) {
    searchPrecisionMode = mode;
    document.getElementById('search-mode-exact')?.classList.toggle('active', mode === 'exact');
    document.getElementById('search-mode-broad')?.classList.toggle('active', mode === 'broad');
    filterVocabTable(true);
}

/**
 * Render thanh chữ cái A-Y hoặc bảng 50 âm あ-わ tương ứng với chế độ từ điển đang chọn
 */
function renderDictionaryIndexBar() {
    const bar = document.getElementById('dict-alphabet-bar');
    const subBar = document.getElementById('dict-subkana-bar');
    if (!bar) return;

    if (currentDictOrderMode === 'chapter') {
        bar.style.display = 'none';
        if (subBar) subBar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';

    if (currentDictOrderMode === 'vn_az' || currentDictOrderMode === 'hv_az') {
        if (subBar) subBar.style.display = 'none';
        let html = `<button type="button" class="dict-idx-pill ${currentDictLetter === 'all' ? 'active' : ''}" onclick="setDictionaryLetterFilter('all')">Tất cả</button>`;
        VN_ALPHABET_LIST.forEach(ch => {
            const isAct = currentDictLetter === ch;
            html += `<button type="button" class="dict-idx-pill ${isAct ? 'active' : ''}" onclick="setDictionaryLetterFilter('${ch}')">${ch}</button>`;
        });
        bar.innerHTML = html;
        return;
    }

    if (currentDictOrderMode === 'jp_50') {
        let html = `<button type="button" class="dict-idx-pill ${currentDictLetter === 'all' ? 'active' : ''}" onclick="setDictionaryLetterFilter('all')">Tất cả 50 âm</button>`;
        GOJUON_ROWS_CONFIG.forEach(r => {
            const isAct = currentDictLetter === r.row;
            html += `<button type="button" class="dict-idx-pill dict-idx-kana ${isAct ? 'active' : ''}" onclick="setDictionaryLetterFilter('${r.row}')">${r.label}</button>`;
        });
        bar.innerHTML = html;

        // Nếu đang chọn 1 hàng cụ thể (VD: か), hiển thị tiếp 5 âm chi tiết (か, き, く, け, こ)
        if (subBar) {
            const activeRowObj = GOJUON_ROWS_CONFIG.find(r => r.row === currentDictLetter);
            if (activeRowObj) {
                subBar.style.display = 'flex';
                let subHtml = `<span class="dict-subkana-label">Chi tiết hàng ${activeRowObj.row}:</span>`;
                subHtml += `<button type="button" class="dict-idx-pill ${currentDictSubKana === 'all' ? 'active' : ''}" onclick="setDictionarySubKanaFilter('all')">Tất cả hàng ${activeRowObj.row}</button>`;
                activeRowObj.cols.forEach(c => {
                    const roma = KANA_TO_ROMAJI_MAP[c] || '';
                    const isAct = currentDictSubKana === c;
                    subHtml += `<button type="button" class="dict-idx-pill dict-idx-kana ${isAct ? 'active' : ''}" onclick="setDictionarySubKanaFilter('${c}')">${c} (${roma})</button>`;
                });
                subBar.innerHTML = subHtml;
            } else {
                subBar.style.display = 'none';
            }
        }
    }
}

/**
 * So sánh 2 mục từ vựng theo chế độ Thứ tự Từ điển đang chọn
 */
function compareItemsByDictionaryOrder(a, b) {
    if (currentDictOrderMode === 'vn_az') {
        return a.vnSortKey.localeCompare(b.vnSortKey, 'vi');
    }
    if (currentDictOrderMode === 'jp_50') {
        if (a.hiraReading && b.hiraReading) {
            return a.hiraReading.localeCompare(b.hiraReading, 'ja');
        }
        if (a.hiraReading) return -1;
        if (b.hiraReading) return 1;
        return a.jpSurface.localeCompare(b.jpSurface, 'ja');
    }
    if (currentDictOrderMode === 'hv_az') {
        const hvA = a.hanVietLower || a.vnSortKey;
        const hvB = b.hanVietLower || b.vnSortKey;
        const cmp = hvA.localeCompare(hvB, 'vi');
        if (cmp !== 0) return cmp;
        return a.vnSortKey.localeCompare(b.vnSortKey, 'vi');
    }
    return 0; // 'chapter' giữ nguyên thứ tự bài học
}

// ==========================================================================
// 5. ĐIỀU KHIỂN GIAO DIỆN & LỌC BẢNG TỪ ĐIỂN
// ==========================================================================

function openVocabSummaryModal(fullscreen = false) {
    if (allVocabList.length === 0) {
        allVocabList = getAggregateVocabData();
    }

    // Nếu trên trang chủ có Session Từ điển (#session-card-dictionary), mở Session đó
    const dictSessionCard = document.getElementById('session-card-dictionary');
    if (dictSessionCard && !fullscreen) {
        if (typeof activeSessionId !== 'undefined' && activeSessionId !== 'dictionary') {
            toggleSessionAccordion('dictionary', null);
        }
        renderDictionaryIndexBar();
        initVocabTableListeners();
        filterVocabTable(true);
        dictSessionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
            document.getElementById('vocab-search-input')?.focus();
        }, 120);
        return;
    }

    toggleDictionaryFullscreen(true);
}

function toggleDictionaryFullscreen(forceState = null) {
    const workspace = document.getElementById('dictionary-workspace');
    if (!workspace) return;

    if (allVocabList.length === 0) {
        allVocabList = getAggregateVocabData();
    }

    const nextState = forceState !== null ? forceState : !isDictionaryFullscreen;
    isDictionaryFullscreen = nextState;

    const dictSessionBody = document.getElementById('session-body-dictionary');
    const dictSessionCard = document.getElementById('session-card-dictionary');
    if (nextState && dictSessionBody && dictSessionBody.style.display === 'none') {
        if (dictSessionCard) dictSessionCard.classList.add('expanded');
        dictSessionBody.style.display = 'block';
        if (typeof activeSessionId !== 'undefined') activeSessionId = 'dictionary';
    }

    workspace.classList.toggle('dict-fullscreen-overlay', nextState);
    document.body.style.overflow = nextState ? 'hidden' : '';

    const fsBtn = document.getElementById('dict-fullscreen-btn');
    if (fsBtn) {
        fsBtn.innerHTML = nextState ? '✕ Thu nhỏ' : '⛶ Toàn màn hình';
    }

    renderDictionaryIndexBar();
    initVocabTableListeners();
    filterVocabTable(true);
}

function closeVocabSummaryModal() {
    if (isDictionaryFullscreen) {
        toggleDictionaryFullscreen(false);
    }
}

function handleVocabSearchInput() {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(() => {
        filterVocabTable(false);
    }, 90);
}

function clearVocabSearch(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterVocabTable(true);
        searchInput.focus();
    }
}

/**
 * Lọc và sắp xếp bảng từ vựng theo Độ khớp chính xác + Thứ tự từ điển
 */
function filterVocabTable(immediate = false) {
    if (!immediate && searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
    }

    if (allVocabList.length === 0) {
        allVocabList = getAggregateVocabData();
    }

    const searchInput = document.getElementById('vocab-search-input');
    const chapterFilter = document.getElementById('vocab-chapter-filter');
    const clearBtn = document.getElementById('search-clear-btn');

    const query = searchInput ? searchInput.value.trim() : '';
    const selectedChapter = chapterFilter ? chapterFilter.value : 'all';

    if (clearBtn) clearBtn.style.display = query ? 'inline-flex' : 'none';

    // Bước 1: Lọc theo Bài học & Chỉ mục Từ điển (Chữ cái A-Y hoặc Hàng 50 âm あ-わ)
    const baseCandidates = allVocabList.filter(item => {
        const matchesChapter = (
            selectedChapter === 'all' ||
            item.chapterId === selectedChapter ||
            item.kanjiGroupId === selectedChapter ||
            (selectedChapter === 'kanji_lessons' && item.isKanjiLesson)
        );
        if (!matchesChapter) return false;

        // Ở chế độ Từ điển Hán-Việt: ưu tiên hiển thị chữ Kanji và Từ vựng Kanji có âm Hán-Việt
        if (currentDictOrderMode === 'hv_az' && !item.hanVietText) {
            return false;
        }
        // Ở chế độ Từ điển 50 âm Nhật: chỉ lấy các mục có âm đọc Kana
        if (currentDictOrderMode === 'jp_50' && !item.jpGojuonRow) {
            return false;
        }

        if (currentDictLetter !== 'all') {
            if (currentDictOrderMode === 'vn_az' && item.vnInitial !== currentDictLetter) {
                return false;
            }
            if (currentDictOrderMode === 'hv_az' && item.hanVietInitial !== currentDictLetter) {
                return false;
            }
            if (currentDictOrderMode === 'jp_50') {
                if (item.jpGojuonRow !== currentDictLetter) return false;
                if (currentDictSubKana !== 'all' && item.jpGojuonCol !== currentDictSubKana) return false;
            }
        }
        return true;
    });

    // Bước 2: Nếu không có từ khóa tìm kiếm -> Sắp xếp chuẩn theo Thứ Tự Từ Điển đang chọn
    if (!query) {
        currentFilteredList = baseCandidates.slice();
        if (currentDictOrderMode !== 'chapter') {
            currentFilteredList.sort(compareItemsByDictionaryOrder);
        }
        renderVocabTable(currentFilteredList, false);
        return;
    }

    // Bước 3: Có từ khóa tìm kiếm -> Chấm điểm Độ khớp 5 Bậc & Cắt nhiễu
    const qLower = query.toLowerCase();
    const qNoSpaces = qLower.replace(/\s+/g, '');
    const qNoTone = removeVietnameseTones(qLower);
    const qWords = qLower.split(/\s+/).filter(Boolean);
    const qNoToneWords = qNoTone.split(/\s+/).filter(Boolean);
    const hasDiacritics = hasVietnameseDiacritics(qLower);
    const isJapanese = hasJapaneseCharacters(query);
    const qHira = !hasDiacritics && !isJapanese ? romajiToHiragana(qNoSpaces) : '';
    const qKata = qHira ? hiraganaToKatakana(qHira) : '';
    const qRomajiNorm = !hasDiacritics && !isJapanese ? normalizeFuzzyRomaji(qLower) : '';

    const qCtx = {
        qRaw: query,
        qLower,
        qNoSpaces,
        qNoTone,
        qWords,
        qNoToneWords,
        hasDiacritics,
        isJapanese,
        qHira,
        qKata,
        qRomajiNorm,
        isBroad: searchPrecisionMode === 'broad'
    };

    let scoredResults = [];
    let maxTierScore = 0;

    for (let i = 0; i < baseCandidates.length; i++) {
        const item = baseCandidates[i];
        const score = scoreVocabSearchMatch(item, qCtx);
        if (score > 0) {
            if (score > maxTierScore) maxTierScore = score;
            scoredResults.push({ item, score });
        }
    }

    // Fallback tự động: nếu ở chế độ Chính xác mà không có từ nào khớp (VD gõ từ viết tắt), tự thử chế độ Mở rộng
    if (scoredResults.length === 0 && !qCtx.isBroad) {
        const broadCtx = { ...qCtx, isBroad: true };
        for (let i = 0; i < baseCandidates.length; i++) {
            const item = baseCandidates[i];
            const score = scoreVocabSearchMatch(item, broadCtx);
            if (score > 0) {
                if (score > maxTierScore) maxTierScore = score;
                scoredResults.push({ item, score });
            }
        }
    }

    // Cắt nhiễu thông minh ở chế độ Chính xác:
    // Nếu đã tìm thấy từ khớp Exact/Segment (≥ 900 điểm), loại bỏ các từ khớp xa dưới 620 điểm
    if (searchPrecisionMode === 'exact' && maxTierScore >= 900) {
        const highPrecision = scoredResults.filter(r => r.score >= 620);
        if (highPrecision.length > 0) {
            scoredResults = highPrecision;
        }
    }

    // Sắp xếp theo Điểm độ khớp giảm dần; nếu bằng điểm thì xếp theo Thứ tự Từ điển đang chọn
    scoredResults.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return compareItemsByDictionaryOrder(a.item, b.item);
    });

    currentFilteredList = scoredResults.map(r => r.item);
    renderVocabTable(currentFilteredList, false);
}

/**
 * Render dữ liệu ra bảng Từ điển theo lô (Infinite Scroll mượt mà)
 */
function renderVocabTable(list, append = false) {
    const tbody = document.getElementById('vocab-table-body');
    const emptyState = document.getElementById('vocab-empty-state');
    const countInfo = document.getElementById('vocab-count-info');
    const tableWrapper = document.querySelector('.vocab-table-wrapper');

    if (!tbody) return;

    if (!append) {
        renderedVocabCount = 0;
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.scrollTop = 0;

        if (list.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            if (countInfo) countInfo.innerText = '0 kết quả phù hợp';
            return;
        } else {
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    if (countInfo) {
        const modeNames = {
            vn_az: 'Từ điển Việt A➔Y',
            jp_50: 'Từ điển Nhật 50 âm あ➔わ',
            hv_az: 'Từ điển Hán-Việt A➔Y',
            chapter: 'Theo bài học'
        };
        const letterInfo = currentDictLetter !== 'all' ? ` • Vần [${currentDictLetter}${currentDictSubKana !== 'all' ? ' / ' + currentDictSubKana : ''}]` : '';
        countInfo.innerText = `Hiển thị ${list.length} mục (${modeNames[currentDictOrderMode] || ''}${letterInfo})`;
    }

    const startIdx = renderedVocabCount;
    const endIdx = Math.min(startIdx + VOCAB_PAGE_SIZE, list.length);
    if (startIdx >= endIdx) return;

    const slice = list.slice(startIdx, endIdx);
    let rowsHtml = '';

    for (let i = 0; i < slice.length; i++) {
        const item = slice[i];
        const index = startIdx + i + 1;
        let jpCellHtml = '';
        let vnCellHtml = '';
        let dictBadge = '';
        let rawSpeak = item.jp;

        if (currentDictOrderMode === 'jp_50' && item.jpGojuonCol) {
            dictBadge = `<span class="dict-initial-badge">${escapeHtml(item.jpGojuonCol)}</span>`;
        } else if (currentDictOrderMode === 'hv_az' && item.hanVietInitial) {
            dictBadge = `<span class="dict-initial-badge">${escapeHtml(item.hanVietInitial)}</span>`;
        } else if (currentDictOrderMode === 'vn_az' && item.vnInitial) {
            dictBadge = `<span class="dict-initial-badge">${escapeHtml(item.vnInitial)}</span>`;
        }

        if (item.isKanjiLesson) {
            jpCellHtml = `${escapeHtml(item.vn)}<span class="td-jp-sub">【${escapeHtml(item.jp)}】</span>`;
            if (item.meta) {
                vnCellHtml = `<span class="td-han-viet-tag">${escapeHtml(item.meta.hanViet)}</span>${escapeHtml(item.meta.nghia)}`;
            } else {
                vnCellHtml = escapeHtml(item.jp);
            }
            rawSpeak = item.jp;
        } else {
            jpCellHtml = escapeHtml(item.jp);
            vnCellHtml = escapeHtml(item.vn);
            if (item.isKanji && item.radicalInfo && item.radicalInfo.primaryRadical) {
                const comps = (item.radicalInfo.radicals || []).filter(r => r !== item.radicalInfo.primaryRadical);
                const compBadges = comps.map(r => `<span class="td-rad-badge td-rad-comp">${escapeHtml(r)}</span>`).join('');
                vnCellHtml += `<div class="td-radical-tags"><span class="td-rad-badge td-rad-primary">📌 ${escapeHtml(item.radicalInfo.primaryRadical)}</span>${compBadges}</div>`;
            }
            rawSpeak = item.jp;
        }

        const speakText = rawSpeak.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

        rowsHtml += `<tr>
            <td class="td-index">${index}</td>
            <td><span class="table-chapter-tag">${escapeHtml(item.chapterLabel)}</span></td>
            <td class="td-jp">${currentDictOrderMode === 'jp_50' ? dictBadge : ''}${jpCellHtml}</td>
            <td class="td-vn">${currentDictOrderMode !== 'jp_50' ? dictBadge : ''}${vnCellHtml}</td>
            <td class="td-audio">
                <button type="button" class="table-speak-btn" title="Nghe phát âm" data-speak="${speakText}">🔊</button>
            </td>
        </tr>`;
    }

    tbody.insertAdjacentHTML('beforeend', rowsHtml);
    renderedVocabCount = endIdx;

    initVocabTableListeners();
}

function initVocabTableListeners() {
    const tbody = document.getElementById('vocab-table-body');
    if (tbody && !tbody._hasAudioDelegation) {
        tbody._hasAudioDelegation = true;
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.table-speak-btn');
            if (btn) {
                e.stopPropagation();
                const text = btn.getAttribute('data-speak');
                if (text && typeof speakJapanese === 'function') {
                    speakJapanese(text);
                }
            }
        });
    }

    const wrapper = document.querySelector('.vocab-table-wrapper');
    if (wrapper && !wrapper._hasScrollListener) {
        wrapper._hasScrollListener = true;
        wrapper.addEventListener('scroll', () => {
            if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 300) {
                if (renderedVocabCount < currentFilteredList.length) {
                    renderVocabTable(currentFilteredList, true);
                }
            }
        }, { passive: true });
    }
}

/**
 * Ôn tập Flashcard trực tiếp từ danh sách từ vựng đang lọc trong Từ điển
 */
function studyCurrentFilteredVocab() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert('Không có từ vựng nào trong danh sách đang lọc để ôn tập!');
        return;
    }

    if (isDictionaryFullscreen) {
        toggleDictionaryFullscreen(false);
    }

    const vocabMap = {};
    const usedKeys = new Set();
    const lessonKeys = [];

    currentFilteredList.forEach(item => {
        let key = item.vn;
        if (usedKeys.has(key) && vocabMap[key] !== item.jp) {
            key = `${key} [${item.chapterLabel}]`;
        }
        usedKeys.add(key);
        vocabMap[key] = item.jp;
        if (item.isKanjiLesson) {
            lessonKeys.push(key);
        }
    });

    const query = document.getElementById('vocab-search-input')?.value.trim() || '';
    let title = 'Từ điển';
    if (query) {
        title = `Từ điển: "${query}" (${currentFilteredList.length} mục)`;
    } else if (currentDictLetter !== 'all') {
        title = `Từ điển • Vần ${currentDictLetter} (${currentFilteredList.length} mục)`;
    } else {
        title = `Từ điển (${currentFilteredList.length} mục)`;
    }

    if (typeof startFlashcardSession === 'function') {
        startFlashcardSession(vocabMap, title, () => studyCurrentFilteredVocab());
        if (lessonKeys.length > 0 && typeof kanjiLessonQuestionKeys !== 'undefined') {
            lessonKeys.forEach(k => kanjiLessonQuestionKeys.add(k));
            if (typeof showQuestion === 'function') showQuestion();
        }
    }
}

// ==========================================================================
// 6. XUẤT FILE & SAO CHÉP MARKDOWN
// ==========================================================================

function generateMarkdownContent() {
    const selectedFilter = document.getElementById('vocab-chapter-filter');
    const filterText = selectedFilter ? selectedFilter.options[selectedFilter.selectedIndex].text : 'Tất cả các bài';
    const query = document.getElementById('vocab-search-input') ? document.getElementById('vocab-search-input').value.trim() : '';

    let mdText = `# 🇯🇵 BẢNG TỪ ĐIỂN & TỔNG HỢP TỪ VỰNG TIẾNG NHẬT\n\n`;
    mdText += `> 📅 **Ngày xuất:** ${new Date().toLocaleDateString('vi-VN')}\n`;
    mdText += `> 📂 **Bộ lọc:** ${filterText}\n`;
    if (query) {
        mdText += `> 🔍 **Từ khóa:** "${query}"\n`;
    }
    mdText += `> 🔢 **Tổng số từ:** ${currentFilteredList.length} từ\n\n`;

    mdText += `| STT | Bài học | Tiếng Nhật | Nghĩa Tiếng Việt |\n`;
    mdText += `| :---: | :--- | :--- | :--- |\n`;

    currentFilteredList.forEach((item, idx) => {
        let displayJp = item.jp;
        let displayVn = item.vn;

        if (item.isKanjiLesson) {
            displayJp = `${item.vn} (${item.jp})`;
            if (item.meta) {
                displayVn = `[${item.meta.hanViet}] ${item.meta.nghia}`;
            } else {
                displayVn = item.jp;
            }
        } else if (item.isKanji && item.radicalInfo && item.radicalInfo.primaryRadical) {
            displayVn = `${item.vn} [Bộ: ${item.radicalInfo.radicals.join(', ')}]`;
        }

        const cleanJp = displayJp.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanVn = displayVn.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanChapter = item.chapterTitle.replace(/\|/g, '\\|');

        mdText += `| ${idx + 1} | ${cleanChapter} | ${cleanJp} | ${cleanVn} |\n`;
    });

    return mdText;
}

function exportVocabToMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để xuất file!");
        return;
    }

    const mdContent = generateMarkdownContent();
    const filterVal = document.getElementById('vocab-chapter-filter').value;
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Tu_Dien_Tieng_Nhat_${filterVal}_${dateStr}.md`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✅ Đã xuất file ${fileName}!`);
}

function copyVocabMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để sao chép!");
        return;
    }

    const mdContent = generateMarkdownContent();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mdContent).then(() => {
            showToast("📋 Đã sao chép bảng Markdown vào bộ nhớ tạm!");
        }).catch(() => {
            fallbackCopy(mdContent);
        });
    } else {
        fallbackCopy(mdContent);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast("📋 Đã sao chép bảng Markdown vào bộ nhớ tạm!");
}
