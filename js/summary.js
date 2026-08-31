/**
 * File: js/summary.js
 * Quản lý tra cứu toàn bộ từ vựng, lọc bài học, tìm kiếm thông minh đa năng (Romaji, Hiragana, Katakana, Tiếng Việt không dấu) và xuất file Markdown (.md)
 */

let allVocabList = [];
let currentFilteredList = [];

// ==========================================================================
// 1. BẢNG MÃ CHUYỂN ĐỔI KANA <-> ROMAJI & TÌM KIẾM THÔNG MINH
// ==========================================================================

const KANA_TO_ROMAJI_MAP = {
    // Digraphs (Hiragana)
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

    // Digraphs (Katakana)
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
    'チェ': 'che',

    // Hiragana basic
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'mo': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'go': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'zo': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'de': 'de', 'do': 'do',
    'ば': 'ba', 'び': 'bi', 'bu': 'bu', 'be': 'be', 'bo': 'bo',
    'ぱ': 'pa', 'pi': 'pi', 'pu': 'pu', 'pe': 'pe', 'po': 'po',

    // Katakana basic
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
    // 3 chars
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

    // 2 chars
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'ti': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'mi', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'ri', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wo': 'を',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'zi': 'じ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'de', 'do': 'do',
    'ba': 'ba', 'bi': 'bi', 'bu': 'bu', 'be': 'be', 'bo': 'bo',
    'pa': 'pa', 'pi': 'pi', 'pu': 'pu', 'pe': 'pe', 'po': 'po',
    'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ', 'je': 'じぇ',
    'fa': 'ふぁ', 'fi': 'ふぃ', 'fe': 'ふぇ', 'fo': 'ふぉ',
    'nn': 'ん',

    // 1 char
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    'n': 'ん'
};
// Đảm bảo đầy đủ ký tự Hiragana
ROMAJI_TO_HIRAGANA_DICT['de'] = 'で';
ROMAJI_TO_HIRAGANA_DICT['do'] = 'ど';
ROMAJI_TO_HIRAGANA_DICT['ba'] = 'ば';
ROMAJI_TO_HIRAGANA_DICT['bi'] = 'び';
ROMAJI_TO_HIRAGANA_DICT['bu'] = 'ぶ';
ROMAJI_TO_HIRAGANA_DICT['be'] = 'べ';
ROMAJI_TO_HIRAGANA_DICT['bo'] = 'ぼ';
ROMAJI_TO_HIRAGANA_DICT['pa'] = 'ぱ';
ROMAJI_TO_HIRAGANA_DICT['pi'] = 'ぴ';
ROMAJI_TO_HIRAGANA_DICT['pu'] = 'ぷ';
ROMAJI_TO_HIRAGANA_DICT['pe'] = 'ぺ';
ROMAJI_TO_HIRAGANA_DICT['po'] = 'ぽ';
ROMAJI_TO_HIRAGANA_DICT['ma'] = 'ま';
ROMAJI_TO_HIRAGANA_DICT['mi'] = 'み';
ROMAJI_TO_HIRAGANA_DICT['mu'] = 'む';
ROMAJI_TO_HIRAGANA_DICT['me'] = 'め';
ROMAJI_TO_HIRAGANA_DICT['mo'] = 'も';
ROMAJI_TO_HIRAGANA_DICT['ra'] = 'ら';
ROMAJI_TO_HIRAGANA_DICT['ri'] = 'り';
ROMAJI_TO_HIRAGANA_DICT['ru'] = 'る';
ROMAJI_TO_HIRAGANA_DICT['re'] = 'れ';
ROMAJI_TO_HIRAGANA_DICT['ro'] = 'ろ';
ROMAJI_TO_HIRAGANA_DICT['ga'] = 'が';
ROMAJI_TO_HIRAGANA_DICT['gi'] = 'ぎ';
ROMAJI_TO_HIRAGANA_DICT['gu'] = 'ぐ';
ROMAJI_TO_HIRAGANA_DICT['ge'] = 'げ';
ROMAJI_TO_HIRAGANA_DICT['go'] = 'ご';
ROMAJI_TO_HIRAGANA_DICT['no'] = 'の';

const SORTED_ROMAJI_KEYS = Object.keys(ROMAJI_TO_HIRAGANA_DICT).sort((a, b) => b.length - a.length);

/**
 * Chuyển chuỗi Kana (Hiragana / Katakana) sang Romaji
 */
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
            if (nextRomaji) {
                res += nextRomaji[0];
            }
            i++;
            continue;
        }
        if (oneChar === 'ー') {
            if (res.length > 0) {
                const last = res[res.length - 1];
                if (['a','i','u','e','o'].includes(last)) {
                    res += last;
                }
            }
            i++;
            continue;
        }
        if (KANA_TO_ROMAJI_MAP[oneChar]) {
            res += KANA_TO_ROMAJI_MAP[oneChar];
        } else {
            res += oneChar;
        }
        i++;
    }
    return res;
}

/**
 * Chuyển chuỗi Romaji (VD: sensei, watashi, kodomo) sang Hiragana (せんせい, わたし, こども)
 */
function romajiToHiragana(text) {
    if (!text) return '';
    let str = text.toLowerCase();
    str = str.replace(/([bcdfghjklmpqrstvwxyz])\1/g, (match, p1) => (p1 === 'n' ? 'nn' : 'っ' + p1));
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
                if (k === 'n' && i + 1 < str.length && ['a','i','u','e','o','y'].includes(str[i+1])) {
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

/**
 * Chuyển Hiragana sang Katakana
 */
function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

/**
 * Bỏ dấu tiếng Việt để tìm kiếm không dấu
 */
function removeVietnameseTones(str) {
    if (!str) return '';
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase();
}

/**
 * Chuẩn hóa Romaji mở rộng để tìm kiếm mờ (ou/oo -> o, sh/sy, ch/ty, v.v.)
 */
function normalizeFuzzyRomaji(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/ou/g, 'o')
        .replace(/oo/g, 'o')
        .replace(/uu/g, 'u')
        .replace(/ii/g, 'i')
        .replace(/ee/g, 'e')
        .replace(/aa/g, 'a')
        .replace(/ha$/g, 'wa')
        .replace(/ha /g, 'wa ')
        .replace(/chi/g, 'ti')
        .replace(/shi/g, 'si')
        .replace(/tsu/g, 'tu')
        .replace(/fu/g, 'hu')
        .replace(/[\s\-\_\(\)\【\】\.\,\~～\?\!\/]/g, '');
}

/**
 * Trích xuất Kana reading nếu có furigana trong ngoặc
 */
function getDisplayRomaji(jp) {
    if (!jp) return '';
    const match = jp.match(/\(([^)]+)\)/);
    const kana = match ? match[1] : jp;
    return kanaToRomaji(kana).trim();
}

// ==========================================================================
// 2. TỔNG HỢP DỮ LIỆU TỪ VỰNG TỪ CÁC BÀI HỌC
// ==========================================================================

/**
 * Gộp toàn bộ từ vựng từ các bài học vào một danh sách phẳng kèm Romaji đã index ngầm
 */
function getAggregateVocabData() {
    const list = [];

    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.id === 'dem') {
            if (typeof generateMixedCounters === 'function') {
                const counters = generateMixedCounters(10);
                for (let vnKey in counters) {
                    const jpVal = counters[vnKey];
                    const romaji = getDisplayRomaji(jpVal);
                    const jpRomaji = kanaToRomaji(jpVal);
                    list.push({
                        chapterId: 'dem',
                        chapterLabel: 'Đếm số',
                        chapterTitle: 'Luyện đếm số',
                        vn: vnKey,
                        jp: jpVal,
                        romaji: romaji,
                        jpRomaji: jpRomaji,
                        vnNorm: removeVietnameseTones(vnKey),
                        romajiNorm: normalizeFuzzyRomaji(romaji),
                        jpRomajiNorm: normalizeFuzzyRomaji(jpRomaji),
                        jpNorm: normalizeFuzzyRomaji(jpVal)
                    });
                }
            }
        } else if (chapter.isKanjiGroup && typeof KANJI_PAGES_CONFIG !== 'undefined') {
            // Nạp toàn bộ 9 trang Kanji vào bảng tra cứu
            KANJI_PAGES_CONFIG.forEach(p => {
                const pData = p.getData();
                if (pData) {
                    for (let vnKey in pData) {
                        const jpVal = pData[vnKey];
                        const romaji = getDisplayRomaji(jpVal);
                        const jpRomaji = kanaToRomaji(jpVal);
                        list.push({
                            chapterId: p.id,
                            chapterLabel: p.shortName,
                            chapterTitle: `${p.shortName} - ${p.title}`,
                            isKanji: true,
                            vn: vnKey,
                            jp: jpVal,
                            romaji: romaji,
                            jpRomaji: jpRomaji,
                            vnNorm: removeVietnameseTones(vnKey),
                            romajiNorm: normalizeFuzzyRomaji(romaji),
                            jpRomajiNorm: normalizeFuzzyRomaji(jpRomaji),
                            jpNorm: normalizeFuzzyRomaji(jpVal)
                        });
                    }
                }
            });
        } else {
            const data = chapter.getData();
            if (data) {
                for (let vnKey in data) {
                    const jpVal = data[vnKey];
                    const romaji = getDisplayRomaji(jpVal);
                    const jpRomaji = kanaToRomaji(jpVal);
                    list.push({
                        chapterId: chapter.id,
                        chapterLabel: chapter.label,
                        chapterTitle: `${chapter.label} - ${chapter.title}`,
                        vn: vnKey,
                        jp: jpVal,
                        romaji: romaji,
                        jpRomaji: jpRomaji,
                        vnNorm: removeVietnameseTones(vnKey),
                        romajiNorm: normalizeFuzzyRomaji(romaji),
                        jpRomajiNorm: normalizeFuzzyRomaji(jpRomaji),
                        jpNorm: normalizeFuzzyRomaji(jpVal)
                    });
                }
            }
        }
    });

    return list;
}

// ==========================================================================
// 3. ĐIỀU KHIỂN GIAO DIỆN & TÌM KIẾM
// ==========================================================================

/**
 * Mở modal tra cứu từ vựng
 */
function openVocabSummaryModal() {
    if (allVocabList.length === 0) {
        allVocabList = getAggregateVocabData();
    }
    const modal = document.getElementById('vocab-summary-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        filterVocabTable();
        setTimeout(() => {
            const searchInput = document.getElementById('vocab-search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    }
}

/**
 * Đóng modal tra cứu từ vựng
 */
function closeVocabSummaryModal() {
    const modal = document.getElementById('vocab-summary-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Đóng modal khi click ra ngoài overlay
 */
function closeVocabSummaryOnOverlay(e) {
    if (e.target && e.target.id === 'vocab-summary-modal') {
        closeVocabSummaryModal();
    }
}

/**
 * Lọc bảng từ vựng thông minh (hỗ trợ Tiếng Việt có dấu/không dấu, Tiếng Nhật, Romaji viết liền/cách)
 */
function filterVocabTable() {
    const searchInput = document.getElementById('vocab-search-input');
    const chapterFilter = document.getElementById('vocab-chapter-filter');
    const clearBtn = document.getElementById('search-clear-btn');

    const query = searchInput ? searchInput.value.trim() : '';
    const selectedChapter = chapterFilter ? chapterFilter.value : 'all';

    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    if (!query) {
        currentFilteredList = allVocabList.filter(item => {
            return selectedChapter === 'all' || item.chapterId === selectedChapter || (selectedChapter === 'kanji' && item.isKanji);
        });
    } else {
        const qClean = query.toLowerCase();
        const qNoSpaces = qClean.replace(/\s+/g, '');
        const qNoTone = removeVietnameseTones(qClean);
        const qNoToneNoSpaces = removeVietnameseTones(qNoSpaces);

        // Chuyển query sang Hiragana & Katakana (cả khi người dùng gõ có dấu cách hoặc viết liền)
        const qHiragana = romajiToHiragana(qClean);
        const qHiraganaNoSpaces = romajiToHiragana(qNoSpaces);
        const qKatakana = hiraganaToKatakana(qHiragana);
        const qKatakanaNoSpaces = hiraganaToKatakana(qHiraganaNoSpaces);

        const qRomajiNorm = normalizeFuzzyRomaji(qClean);
        const qHiraNorm = normalizeFuzzyRomaji(qHiragana);

        currentFilteredList = allVocabList.filter(item => {
            const matchesChapter = (
                selectedChapter === 'all' ||
                item.chapterId === selectedChapter ||
                (selectedChapter === 'kanji' && item.isKanji)
            );
            if (!matchesChapter) return false;

            const matchesSearch =
                item.vn.toLowerCase().includes(qClean) ||
                (item.vnNorm && (item.vnNorm.includes(qNoTone) || item.vnNorm.replace(/\s+/g, '').includes(qNoToneNoSpaces))) ||
                item.jp.toLowerCase().includes(qClean) ||
                item.jp.includes(qHiragana) ||
                item.jp.includes(qHiraganaNoSpaces) ||
                item.jp.includes(qKatakana) ||
                item.jp.includes(qKatakanaNoSpaces) ||
                (item.romaji && (item.romaji.toLowerCase().includes(qClean) || item.romaji.toLowerCase().replace(/\s+/g, '').includes(qNoSpaces))) ||
                (item.jpRomaji && (item.jpRomaji.toLowerCase().includes(qClean) || item.jpRomaji.toLowerCase().replace(/\s+/g, '').includes(qNoSpaces))) ||
                (item.romajiNorm && item.romajiNorm.includes(qRomajiNorm)) ||
                (item.jpRomajiNorm && item.jpRomajiNorm.includes(qRomajiNorm)) ||
                (item.jpNorm && item.jpNorm.includes(qHiraNorm)) ||
                item.chapterLabel.toLowerCase().includes(qClean) ||
                item.chapterTitle.toLowerCase().includes(qClean);

            return matchesSearch;
        });
    }

    renderVocabTable(currentFilteredList);
}

/**
 * Xóa nội dung tìm kiếm
 */
function clearVocabSearch() {
    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterVocabTable();
        searchInput.focus();
    }
}

/**
 * Render dữ liệu ra bảng HTML sạch đẹp, gọn gàng (chỉ hiển thị Tiếng Nhật & Tiếng Việt)
 */
function renderVocabTable(list) {
    const tbody = document.getElementById('vocab-table-body');
    const emptyState = document.getElementById('vocab-empty-state');
    const countInfo = document.getElementById('vocab-count-info');

    if (countInfo) {
        countInfo.innerText = `Hiển thị ${list.length} / ${allVocabList.length} từ vựng`;
    }

    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        return;
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }

    const fragment = document.createDocumentFragment();
    list.forEach((item, index) => {
        const tr = document.createElement('tr');

        // STT
        const tdIndex = document.createElement('td');
        tdIndex.className = 'td-index';
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        // Chapter Tag
        const tdChapter = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `table-chapter-tag tag-${item.chapterId}`;
        badge.textContent = item.chapterLabel;
        tdChapter.appendChild(badge);
        tr.appendChild(tdChapter);

        // Tiếng Nhật
        const tdJp = document.createElement('td');
        tdJp.className = 'td-jp';
        tdJp.textContent = item.jp;
        tr.appendChild(tdJp);

        // Nghĩa Tiếng Việt
        const tdVn = document.createElement('td');
        tdVn.className = 'td-vn';
        tdVn.textContent = item.vn;
        tr.appendChild(tdVn);

        // Nút phát âm
        const tdAudio = document.createElement('td');
        tdAudio.className = 'td-audio';
        const audioBtn = document.createElement('button');
        audioBtn.className = 'table-speak-btn';
        audioBtn.title = 'Nghe phát âm';
        audioBtn.innerHTML = '🔊';
        audioBtn.onclick = () => speakJapanese(item.jp);
        tdAudio.appendChild(audioBtn);
        tr.appendChild(tdAudio);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

// ==========================================================================
// 4. XUẤT FILE & SAO CHÉP MARKDOWN
// ==========================================================================

/**
 * Sinh chuỗi Markdown (.md) từ danh sách đang lọc
 */
function generateMarkdownContent() {
    const selectedFilter = document.getElementById('vocab-chapter-filter');
    const filterText = selectedFilter ? selectedFilter.options[selectedFilter.selectedIndex].text : 'Tất cả các bài';
    const query = document.getElementById('vocab-search-input') ? document.getElementById('vocab-search-input').value.trim() : '';

    let mdText = `# 🇯🇵 BẢNG TỔNG HỢP TỪ VỰNG TIẾNG NHẬT N5\n\n`;
    mdText += `> 📅 **Ngày xuất:** ${new Date().toLocaleDateString('vi-VN')}\n`;
    mdText += `> 📂 **Bộ lọc bài học:** ${filterText}\n`;
    if (query) {
        mdText += `> 🔍 **Từ khóa tìm kiếm:** "${query}"\n`;
    }
    mdText += `> 🔢 **Tổng số từ:** ${currentFilteredList.length} từ\n\n`;

    mdText += `| STT | Bài học | Tiếng Nhật | Nghĩa Tiếng Việt |\n`;
    mdText += `| :---: | :--- | :--- | :--- |\n`;

    currentFilteredList.forEach((item, idx) => {
        const cleanJp = item.jp.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanVn = item.vn.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanChapter = item.chapterTitle.replace(/\|/g, '\\|');

        mdText += `| ${idx + 1} | ${cleanChapter} | ${cleanJp} | ${cleanVn} |\n`;
    });

    mdText += `\n---\n*Tài liệu được xuất tự động từ website Japanese-Vocab*\n`;
    return mdText;
}

/**
 * Xuất và tải file Markdown (.md) về máy
 */
function exportVocabToMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để xuất file!");
        return;
    }

    const mdContent = generateMarkdownContent();
    const filterVal = document.getElementById('vocab-chapter-filter').value;
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Tu_Vung_Tieng_Nhat_${filterVal}_${dateStr}.md`;

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

    showToast(`✅ Đã xuất file Markdown ${fileName} thành công!`);
}

/**
 * Sao chép bảng Markdown vào Clipboard
 */
function copyVocabMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để sao chép!");
        return;
    }

    const mdContent = generateMarkdownContent();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mdContent).then(() => {
            showToast("📋 Đã sao chép nội dung Markdown vào bộ nhớ tạm!");
        }).catch(() => {
            fallbackCopy(mdContent);
        });
    } else {
        fallbackCopy(mdContent);
    }
}

/**
 * Phương thức fallback sao chép cho trình duyệt cũ
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("📋 Đã sao chép nội dung Markdown!");
}
