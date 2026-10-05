export const SECTIONS = [
  {
    id: "torah",
    testament: "Old Testament",
    label: "Law",
    blurb: "How the world starts, and the covenant that forms a people.",
  },
  {
    id: "history",
    testament: "Old Testament",
    label: "History",
    blurb: "From the land, through the kingdom, into exile and home again.",
  },
  {
    id: "wisdom",
    testament: "Old Testament",
    label: "Wisdom and poetry",
    blurb: "Prayer, proverb, and the argument about suffering.",
  },
  {
    id: "major",
    testament: "Old Testament",
    label: "Major prophets",
    blurb: "Long books that warn, weep, and promise.",
  },
  {
    id: "minor",
    testament: "Old Testament",
    label: "Minor prophets",
    blurb: "Shorter books. Not smaller in weight.",
  },
  {
    id: "gospels",
    testament: "New Testament",
    label: "Gospels",
    blurb: "Four witnesses to the life, death, and resurrection of Jesus.",
  },
  {
    id: "acts",
    testament: "New Testament",
    label: "Acts",
    blurb: "What the risen Jesus does through his people.",
  },
  {
    id: "paul",
    testament: "New Testament",
    label: "Paul's letters",
    blurb: "Churches and coworkers, taught from the road and from prison.",
  },
  {
    id: "general",
    testament: "New Testament",
    label: "General letters",
    blurb: "Sermons and notes for believers under pressure.",
  },
  {
    id: "apocalypse",
    testament: "New Testament",
    label: "Revelation",
    blurb: "A vision meant to keep the church faithful.",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export type BookMeta = {
  id: string;
  name: string;
  testament: "ot" | "nt";
  section: SectionId;
  idea: string;
  about: string;
};

export const BOOK_META: BookMeta[] = [
  {
    id: "genesis",
    name: "Genesis",
    testament: "ot",
    section: "torah",
    idea: "The beginning of the world, of a family, and of a promise.",
    about:
      "God makes a good world, people turn from him, and he chooses Abraham's family as the way he will bless every nation. The book moves from creation and the flood to the patriarchs: Abraham, Isaac, Jacob, and Joseph in Egypt.",
  },
  {
    id: "exodus",
    name: "Exodus",
    testament: "ot",
    section: "torah",
    idea: "God rescues Israel from slavery and meets them at Sinai.",
    about:
      "Moses leads the people out of Egypt, through the sea, and to the mountain where God gives the law and the pattern for a tent where he will dwell. Freedom is the start of a covenant, not the end of the story.",
  },
  {
    id: "leviticus",
    name: "Leviticus",
    testament: "ot",
    section: "torah",
    idea: "How a holy God lives in the middle of an unholy people.",
    about:
      "Most of the book is worship: sacrifices, priests, purity, and the Day of Atonement. It is slow reading on purpose. Coming near to God is possible, and it is never casual.",
  },
  {
    id: "numbers",
    name: "Numbers",
    testament: "ot",
    section: "torah",
    idea: "Israel in the wilderness, counted, complaining, and still led.",
    about:
      "Two censuses give the book its name. Between them a generation refuses to trust God for the land and dies in the desert, while God keeps feeding the people he does not abandon.",
  },
  {
    id: "deuteronomy",
    name: "Deuteronomy",
    testament: "ot",
    section: "torah",
    idea: "Moses' last sermons, on the edge of the land.",
    about:
      "Moses retells the story, repeats the law, and urges Israel to love God with the whole heart. Blessing and curse are set in front of them. The book is a charge to remember.",
  },
  {
    id: "joshua",
    name: "Joshua",
    testament: "ot",
    section: "history",
    idea: "Entering the land God promised.",
    about:
      "Joshua leads Israel across the Jordan, through Jericho, and into a long settlement. The book is about courage, obedience, and a home that is received rather than earned.",
  },
  {
    id: "judges",
    name: "Judges",
    testament: "ot",
    section: "history",
    idea: "A cycle of forgetting, collapse, and rescue.",
    about:
      "After Joshua, Israel repeatedly leaves God, suffers under oppressors, and is saved by unlikely judges. The refrain is that everyone did what was right in their own eyes.",
  },
  {
    id: "ruth",
    name: "Ruth",
    testament: "ot",
    section: "history",
    idea: "Loyalty in a bitter time, inside the chaos of Judges.",
    about:
      "A Moabite widow refuses to leave her Israelite mother-in-law, and God folds her into the family line of David. The book is short, and its subject is stubborn kindness.",
  },
  {
    id: "1samuel",
    name: "1 Samuel",
    testament: "ot",
    section: "history",
    idea: "From the last judge to the first king.",
    about:
      "Samuel anoints Saul, Saul fails, and God chooses David. The book asks what kind of king can actually shepherd God's people.",
  },
  {
    id: "2samuel",
    name: "2 Samuel",
    testament: "ot",
    section: "history",
    idea: "David's reign, at its height and in its ruin.",
    about:
      "The kingdom is established, and God promises David a house that will last. Then David's sin with Bathsheba unravels his family. The promise has to survive the man.",
  },
  {
    id: "1kings",
    name: "1 Kings",
    testament: "ot",
    section: "history",
    idea: "Solomon's glory, and the kingdom tearing in two.",
    about:
      "Wisdom, the temple, and wealth give way to idolatry. After Solomon the nation splits into Israel in the north and Judah in the south. Prophets begin to confront the throne.",
  },
  {
    id: "2kings",
    name: "2 Kings",
    testament: "ot",
    section: "history",
    idea: "Both kingdoms slide toward exile.",
    about:
      "Elijah and Elisha confront kings, but neither nation turns for long. Israel falls to Assyria. Judah falls to Babylon. The temple burns.",
  },
  {
    id: "1chronicles",
    name: "1 Chronicles",
    testament: "ot",
    section: "history",
    idea: "David's reign, retold for people who came home.",
    about:
      "Written after the exile, it walks the same years as Samuel with special attention to worship, the ark, and the line God promised to keep. Genealogies open the book because identity mattered to a remnant.",
  },
  {
    id: "2chronicles",
    name: "2 Chronicles",
    testament: "ot",
    section: "history",
    idea: "Judah's kings, measured by the temple and by prayer.",
    about:
      "The focus stays on the southern kingdom. Reformers such as Hezekiah and Josiah shine. The book ends in exile and, in its last lines, with a decree that sends the people home.",
  },
  {
    id: "ezra",
    name: "Ezra",
    testament: "ot",
    section: "history",
    idea: "Coming back, and rebuilding the temple.",
    about:
      "A remnant returns from Babylon, restores worship in Jerusalem, and Ezra calls the community back to the law. Renewal is slow, public, and contested.",
  },
  {
    id: "nehemiah",
    name: "Nehemiah",
    testament: "ot",
    section: "history",
    idea: "Rebuilding the walls, and the people inside them.",
    about:
      "Nehemiah organizes a battered city to rebuild, then joins the work of reforming the community's life. Prayer and practical leadership sit side by side.",
  },
  {
    id: "esther",
    name: "Esther",
    testament: "ot",
    section: "history",
    idea: "Deliverance in a foreign court, with God unnamed.",
    about:
      "Esther, a Jewish queen in Persia, risks her life to stop a planned massacre. The book never says the name of God. The timing of the deliverance is the argument.",
  },
  {
    id: "job",
    name: "Job",
    testament: "ot",
    section: "wisdom",
    idea: "A righteous man suffers, and easy answers fail.",
    about:
      "Job loses his children, his health, and the respect of his friends, who insist the suffering must be his fault. God finally speaks, not with a theory of pain, but with his own wisdom and presence.",
  },
  {
    id: "psalms",
    name: "Psalms",
    testament: "ot",
    section: "wisdom",
    idea: "The prayer book of the Bible.",
    about:
      "One hundred and fifty poems of praise, lament, trust, and anger, many of them tied to David. They give words for talking to God when life is whole and when it is not. It is a collection gathered over centuries, not a single sitting.",
  },
  {
    id: "proverbs",
    name: "Proverbs",
    testament: "ot",
    section: "wisdom",
    idea: "Short wisdom for speech, work, money, and pride.",
    about:
      "Most of the sayings are attached to Solomon. The fear of the Lord is where they start. The book trains judgment more than it tells a story, and it is often better in small portions than in a rush.",
  },
  {
    id: "ecclesiastes",
    name: "Ecclesiastes",
    testament: "ot",
    section: "wisdom",
    idea: "A hard look at life under the sun.",
    about:
      "The Teacher tests pleasure, work, and wisdom and finds them thin apart from God. The conclusion is to fear God and to receive ordinary gifts while you can. It is honest about death.",
  },
  {
    id: "song",
    name: "Song of Solomon",
    testament: "ot",
    section: "wisdom",
    idea: "Love poetry between a bride and a bridegroom.",
    about:
      "The book celebrates desire, pursuit, and delight. Readers have also heard in it a picture of faithful love. Either way, it refuses to treat the body as an embarrassment.",
  },
  {
    id: "isaiah",
    name: "Isaiah",
    testament: "ot",
    section: "major",
    idea: "Judgment on a faithless people, and a hope larger than exile.",
    about:
      "Isaiah warns Judah, names a coming king, and speaks of a servant who suffers for others. The later chapters promise a restored people and a world put right. It is the long prophetic book the New Testament quotes most.",
  },
  {
    id: "jeremiah",
    name: "Jeremiah",
    testament: "ot",
    section: "major",
    idea: "A prophet who weeps over a city that will not listen.",
    about:
      "Jeremiah warns of Babylon for decades and is rejected for it. He also promises a new covenant, written on the heart. The book mixes sermons, stories, and the prophet's own grief.",
  },
  {
    id: "lamentations",
    name: "Lamentations",
    testament: "ot",
    section: "major",
    idea: "Funeral poems for fallen Jerusalem.",
    about:
      "Five poems sit in the ruins of the city and the temple. Grief is unsparing here. So is a small, fierce hope: the steadfast love of the Lord is not spent.",
  },
  {
    id: "ezekiel",
    name: "Ezekiel",
    testament: "ot",
    section: "major",
    idea: "Visions from exile: the glory leaves, and then returns.",
    about:
      "Ezekiel, a priest by the rivers of Babylon, sees judgment on Jerusalem and dry bones made to live. The book ends with a temple and with God dwelling among his people again. The images are strange on purpose.",
  },
  {
    id: "daniel",
    name: "Daniel",
    testament: "ot",
    section: "major",
    idea: "Faithfulness inside an empire, and a kingdom that outlasts empires.",
    about:
      "Daniel and his friends serve Babylon without bending to it. The later visions show human powers rising and falling until God gives the kingdom to one like a son of man. It is both a court story and an apocalypse.",
  },
  {
    id: "hosea",
    name: "Hosea",
    testament: "ot",
    section: "minor",
    idea: "A broken marriage as a picture of Israel's unfaithfulness.",
    about:
      "God tells Hosea to love a wife who leaves him, then uses that pain to describe his own love for a people chasing other gods. The book is tender and severe in the same chapter.",
  },
  {
    id: "joel",
    name: "Joel",
    testament: "ot",
    section: "minor",
    idea: "A locust plague becomes a warning about the day of the Lord.",
    about:
      "Joel calls the people to return to God with fasting and tears. He promises that God will pour out his Spirit on all kinds of people. Scholars disagree about when he wrote; the summons does not depend on the date.",
  },
  {
    id: "amos",
    name: "Amos",
    testament: "ot",
    section: "minor",
    idea: "God rejects worship that ignores the poor.",
    about:
      "A shepherd from Judah preaches to prosperous northern Israel. Religious festivals continue while the weak are sold. Amos says justice is what God wanted from them, and still promises that David's fallen house will be raised.",
  },
  {
    id: "obadiah",
    name: "Obadiah",
    testament: "ot",
    section: "minor",
    idea: "A short oracle against Edom's pride.",
    about:
      "Edom gloated when Judah fell. Obadiah says that pride will be judged, and that the kingdom will be the Lord's. It is the shortest book in the Old Testament.",
  },
  {
    id: "jonah",
    name: "Jonah",
    testament: "ot",
    section: "minor",
    idea: "A prophet runs from a mission of mercy.",
    about:
      "Jonah flees, is swallowed, and finally preaches to Nineveh, which repents. He is angry that God is kind to an enemy. The book is a story about the wideness of mercy, told against its own preacher.",
  },
  {
    id: "micah",
    name: "Micah",
    testament: "ot",
    section: "minor",
    idea: "What God wants: justice, mercy, and a humble walk.",
    about:
      "Micah condemns corrupt leaders and false comfort, then says God has already shown what is good. He also promises a ruler from Bethlehem. Judgment and hope share the page.",
  },
  {
    id: "nahum",
    name: "Nahum",
    testament: "ot",
    section: "minor",
    idea: "Nineveh's cruelty will end.",
    about:
      "A generation after Jonah, Nahum announces the fall of Assyria. God's patience is not the same thing as indifference. The poetry is fierce because the empire was.",
  },
  {
    id: "habakkuk",
    name: "Habakkuk",
    testament: "ot",
    section: "minor",
    idea: "A prophet argues with God about violence, then chooses joy.",
    about:
      "Habakkuk asks why injustice wins. God answers that he will judge, in his own time, and that the righteous live by faith. The book ends with a decision to rejoice even when the fields fail.",
  },
  {
    id: "zephaniah",
    name: "Zephaniah",
    testament: "ot",
    section: "minor",
    idea: "The day of the Lord is near, and so is a song.",
    about:
      "Zephaniah warns that judgment will sweep Judah and the nations, then promises a humble remnant. The closing picture is God rejoicing over his people. Warning is not the last word.",
  },
  {
    id: "haggai",
    name: "Haggai",
    testament: "ot",
    section: "minor",
    idea: "Put the temple back at the center.",
    about:
      "After the return, people panel their own houses while the temple sits unfinished. Haggai tells them to build, and ties the work to God's presence and a future glory greater than the first house.",
  },
  {
    id: "zechariah",
    name: "Zechariah",
    testament: "ot",
    section: "minor",
    idea: "Night visions for builders, and a king still to come.",
    about:
      "Zechariah encourages the rebuild with strange, hopeful visions, then looks ahead to a king on a donkey and to God cleansing his people. It is one of the prophets the Gospels echo.",
  },
  {
    id: "malachi",
    name: "Malachi",
    testament: "ot",
    section: "minor",
    idea: "A last warning before a long quiet.",
    about:
      "Malachi confronts half-hearted worship, corrupt priests, and stingy giving. He ends by promising a messenger who will prepare the way. In the usual order, this is the Old Testament's last page.",
  },
  {
    id: "matthew",
    name: "Matthew",
    testament: "nt",
    section: "gospels",
    idea: "Jesus is the promised king, and he teaches a kingdom.",
    about:
      "Matthew traces Jesus to Abraham and David, gathers his teaching (including the Sermon on the Mount), and shows him fulfilling the Scriptures of Israel. It ends with a commission to all nations.",
  },
  {
    id: "mark",
    name: "Mark",
    testament: "nt",
    section: "gospels",
    idea: "The urgent, spare account of Jesus' authority and his cross.",
    about:
      "Mark moves quickly. Jesus teaches, heals, and clashes with the powerful, then gives his life as a ransom. It is the shortest gospel, and a good place to start.",
  },
  {
    id: "luke",
    name: "Luke",
    testament: "nt",
    section: "gospels",
    idea: "A careful history of Jesus, with room for outsiders.",
    about:
      "Luke writes an ordered account for Theophilus, from the birth stories through the resurrection, with attention to women, the poor, and prayer. His second volume is Acts.",
  },
  {
    id: "john",
    name: "John",
    testament: "nt",
    section: "gospels",
    idea: "Who Jesus is, told in signs and long conversations.",
    about:
      "John opens with the Word made flesh and chooses signs so that readers will believe Jesus is the Christ, the Son of God. Life, light, and love are the words he keeps returning to.",
  },
  {
    id: "acts",
    name: "Acts",
    testament: "nt",
    section: "acts",
    idea: "What happened after the resurrection.",
    about:
      "The Spirit comes at Pentecost, and the news about Jesus spreads from Jerusalem toward Rome. Peter leads the early chapters. Paul carries most of the rest. It is Luke's second volume.",
  },
  {
    id: "romans",
    name: "Romans",
    testament: "nt",
    section: "paul",
    idea: "Paul's fullest account of the gospel.",
    about:
      "Jews and Gentiles alike are under sin, justified by faith, and called into a new life. The later chapters turn that teaching into a shared life: worship, gifts, and love that outdoes evil.",
  },
  {
    id: "1corinthians",
    name: "1 Corinthians",
    testament: "nt",
    section: "paul",
    idea: "A gifted, fractured church is called back to the cross.",
    about:
      "Paul answers their questions about division, sex, worship, food, and the resurrection. Love is the more excellent way. The risen Christ is the foundation under every argument.",
  },
  {
    id: "2corinthians",
    name: "2 Corinthians",
    testament: "nt",
    section: "paul",
    idea: "Power that shows up in weakness.",
    about:
      "False teachers have wooed the church, and Paul opens his hardships rather than polishing his image. God's strength lands in frail people. Reconciliation is the heart of the message.",
  },
  {
    id: "galatians",
    name: "Galatians",
    testament: "nt",
    section: "paul",
    idea: "You do not add conditions to the gospel.",
    about:
      "Some are telling Gentile believers they must keep the law of Moses to belong. Paul says justification is by faith in Christ, and that freedom is for love, not for self-indulgence.",
  },
  {
    id: "ephesians",
    name: "Ephesians",
    testament: "nt",
    section: "paul",
    idea: "The church as one new people in Christ.",
    about:
      "Paul stacks blessing, grace, and unity, then describes households reshaped by that calling. The letter's horizon is cosmic: Christ filling everything, and a people learning to stand.",
  },
  {
    id: "philippians",
    name: "Philippians",
    testament: "nt",
    section: "paul",
    idea: "Joy from prison, and the mind of Christ.",
    about:
      "Paul thanks a generous church, warns them about confidence in status, and points to Jesus' humility. Partnership in the gospel is the thread. The tone is warm and unguarded.",
  },
  {
    id: "colossians",
    name: "Colossians",
    testament: "nt",
    section: "paul",
    idea: "Christ is enough. He holds the whole creation.",
    about:
      "A young church is being offered extra spiritual systems. Paul says the fullness of God dwells in Jesus, and that a new life follows from being raised with him. No supplement is required.",
  },
  {
    id: "1thessalonians",
    name: "1 Thessalonians",
    testament: "nt",
    section: "paul",
    idea: "Encouragement for a young church under pressure.",
    about:
      "Paul recalls how they received the word, urges holiness, and comforts them about believers who have died. Hope in Christ's return holds the letter together.",
  },
  {
    id: "2thessalonians",
    name: "2 Thessalonians",
    testament: "nt",
    section: "paul",
    idea: "Steady work while you wait.",
    about:
      "Some are shaken about the day of the Lord, and some have stopped working. Paul tells them not to quit ordinary life, and to stand firm in the truth they already received.",
  },
  {
    id: "1timothy",
    name: "1 Timothy",
    testament: "nt",
    section: "paul",
    idea: "How to lead and care for a church.",
    about:
      "Paul writes to a younger coworker about teaching, worship, elders, and the people who need protection. The aim is love from a pure heart, a good conscience, and sincere faith.",
  },
  {
    id: "2timothy",
    name: "2 Timothy",
    testament: "nt",
    section: "paul",
    idea: "Paul's last letter: guard the gospel, and endure.",
    about:
      "From prison, expecting death, Paul asks Timothy to keep teaching and to trust Scripture. It is personal and urgent. Faithfulness here looks like finishing the course.",
  },
  {
    id: "titus",
    name: "Titus",
    testament: "nt",
    section: "paul",
    idea: "Setting a church in order, with grace that trains.",
    about:
      "Paul tells Titus to appoint elders on Crete and to teach a people how grace produces ordinary goodness. Good works in this letter are fruit, not a fee.",
  },
  {
    id: "philemon",
    name: "Philemon",
    testament: "nt",
    section: "paul",
    idea: "A personal appeal that calls a slave a brother.",
    about:
      "Paul sends Onesimus back to Philemon and asks that he be received as more than property. The gospel rearranges power inside a household. The letter is only one chapter.",
  },
  {
    id: "hebrews",
    name: "Hebrews",
    testament: "nt",
    section: "general",
    idea: "Jesus is better than every shadow that came before him.",
    about:
      "A sermon in the form of a letter argues that Jesus surpasses angels, Moses, and the old sacrifices, because he is the final priest and the final offering. The author is unnamed. The charge is to hold fast and not drift.",
  },
  {
    id: "james",
    name: "James",
    testament: "nt",
    section: "general",
    idea: "Faith that does nothing is dead.",
    about:
      "James writes to scattered believers about trials, speech, favoritism, and patience. Real wisdom shows up in a life. The letter is blunt, and it is practical on purpose.",
  },
  {
    id: "1peter",
    name: "1 Peter",
    testament: "nt",
    section: "general",
    idea: "Hope for exiles who suffer for doing good.",
    about:
      "Peter calls believers living stones and urges them to endure unjust suffering the way Christ did. Holiness and hope belong together. The readers are resident aliens in the empire.",
  },
  {
    id: "2peter",
    name: "2 Peter",
    testament: "nt",
    section: "general",
    idea: "Grow up, and do not be moved by scoffers.",
    about:
      "Peter reminds them of the truth they already have and warns that people will mock the promise of Christ's return. The world, he says, ends in judgment and in newness. Scripture is not a private invention.",
  },
  {
    id: "1john",
    name: "1 John",
    testament: "nt",
    section: "general",
    idea: "Tests of real life with God: truth, love, and obedience.",
    about:
      "John writes so that believers can know they have eternal life. Walking in the light, loving one another, and confessing the Son are the signs he keeps circling. The tone is pastoral, not speculative.",
  },
  {
    id: "2john",
    name: "2 John",
    testament: "nt",
    section: "general",
    idea: "Walk in love, and do not welcome a false teaching.",
    about:
      "A short note encourages a congregation to keep loving one another and to refuse teachers who deny that Jesus came in the flesh. Hospitality has a limit when the message is at stake.",
  },
  {
    id: "3john",
    name: "3 John",
    testament: "nt",
    section: "general",
    idea: "Support the people who travel with the truth.",
    about:
      "John praises Gaius for hospitality and warns about a man who shuts it down to protect his own place. Faithfulness, in this note, looks like an open door.",
  },
  {
    id: "jude",
    name: "Jude",
    testament: "nt",
    section: "general",
    idea: "Contend for the faith that was handed to you.",
    about:
      "Jude had wanted to write about salvation, and instead warns about people who twist grace into permission. He closes by blessing the God who is able to keep you. Like Philemon, it is a single chapter.",
  },
  {
    id: "revelation",
    name: "Revelation",
    testament: "nt",
    section: "apocalypse",
    idea: "A vision of Jesus, the church's trial, and the world made new.",
    about:
      "John writes to seven churches, then sees a lamb who was slain, opening history toward a new heaven and a new earth. It is written to sustain loyalty when an empire demands worship. The last word is not the beast. It is God dwelling with his people.",
  },
];
