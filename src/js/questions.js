// Flowers of Quran - Official 24 Flowers Quiz Dataset (72 Questions mapped to PDF Page Ranges)

const FLOWERS_DATA = [
  // Flower 1 (Pages 1-10)
  {
    id: 1,
    title: "Beginning with Allah's Name",
    subtitle: "Pages 1 – 10",
    icon: "🌸",
    questions: [
      {
        question: "In whose name should we begin all our work?",
        options: ["Allah", "I don't know"],
        correct: 0,
        explanation: "We should always begin all our good actions by saying Bismillah (in the name of Allah)."
      },
      {
        question: "Whom should we worship and pray to?",
        options: ["I don't know", "Allah"],
        correct: 1,
        explanation: "Allah is the only Creator and Sustainer, so we worship and pray to Allah alone."
      },
      {
        question: "What does 'Fear Allah' mean?",
        options: ["Obey Allah", "Run away from Allah"],
        correct: 0,
        explanation: "Fearing Allah (Taqwa) means loving and obeying Him, and staying away from what displeases Him."
      }
    ]
  },

  // Flower 2 (Pages 11-20)
  {
    id: 2,
    title: "Allah's All-Hearing & Seeing",
    subtitle: "Pages 11 – 20",
    icon: "🌺",
    questions: [
      {
        question: "Who is All-Seeing and All-Hearing?",
        options: ["All people", "Only Allah"],
        correct: 1,
        explanation: "Only Allah sees everything and hears everything at all times."
      },
      {
        question: "Whom should we ask to protect us?",
        options: ["Allah", "I don't know"],
        correct: 0,
        explanation: "We turn to Allah for protection and safety from all harm."
      },
      {
        question: "When do we prostrate to Allah?",
        options: ["While praying", "While walking"],
        correct: 0,
        explanation: "We make Sujud (prostration) to Allah during our daily prayers."
      }
    ]
  },

  // Flower 3 (Pages 21-30)
  {
    id: 3,
    title: "Endless Blessings & Light",
    subtitle: "Pages 21 – 30",
    icon: "🌻",
    questions: [
      {
        question: "Whose blessings are endless?",
        options: ["I don't know", "Allah's"],
        correct: 1,
        explanation: "Allah's blessings upon us are endless and cannot be counted."
      },
      {
        question: "Is Allah Kind and Gentle?",
        options: ["Yes", "I don't know"],
        correct: 0,
        explanation: "Allah is Ar-Ra'uf (The Most Kind) and Al-Latif (The Most Gentle)."
      },
      {
        question: "Allah is the Light of what?",
        options: ["The earth only", "The heavens and the earth"],
        correct: 1,
        explanation: "Allah is the Light (Nur) of the heavens and the earth."
      }
    ]
  },

  // Flower 4 (Pages 31-40)
  {
    id: 4,
    title: "Lord of Everyone & Most Merciful",
    subtitle: "Pages 31 – 40",
    icon: "🌷",
    questions: [
      {
        question: "Who is the Lord of everyone?",
        options: ["I don't know", "Allah"],
        correct: 1,
        explanation: "Allah is Rabb al-Alamin, the Creator and Cherisher of all creation."
      },
      {
        question: "What does 'Most Merciful' mean?",
        options: ["Very Kind", "I don't know"],
        correct: 0,
        explanation: "Most Merciful (Ar-Rahim) means Allah is full of endless kindness and mercy."
      },
      {
        question: "Who is the only God?",
        options: ["I don't know", "Allah"],
        correct: 1,
        explanation: "La ilaha illa-Allah: There is no deity worthy of worship except Allah."
      }
    ]
  },

  // Flower 5 (Pages 41-50)
  {
    id: 5,
    title: "Remembering Allah & Provision",
    subtitle: "Pages 41 – 50",
    icon: "🌹",
    questions: [
      {
        question: "Should we remember Allah much or little?",
        options: ["Little", "Much"],
        correct: 1,
        explanation: "We are encouraged to remember Allah (Dhikr) frequently every day."
      },
      {
        question: "Who provides food and drink for us?",
        options: ["I don't know", "Allah"],
        correct: 1,
        explanation: "Allah is Ar-Razzaq, the Provider who gives us food, drink, and sustenance."
      },
      {
        question: "How should we stand before Allah?",
        options: ["Respectfully", "Proudly"],
        correct: 0,
        explanation: "We should stand before Allah with humility, respect, and devotion."
      }
    ]
  },

  // Flower 6 (Pages 51-60)
  {
    id: 6,
    title: "Beautiful Names & Creation",
    subtitle: "Pages 51 – 60",
    icon: "💐",
    questions: [
      {
        question: "Who has the most beautiful names?",
        options: ["I don't know", "Allah"],
        correct: 1,
        explanation: "Allah has Asma' al-Husna (the Most Beautiful Names)."
      },
      {
        question: "From what did Allah create us?",
        options: ["Dust", "Air"],
        correct: 0,
        explanation: "Allah created human beings from clay and dust."
      },
      {
        question: "Who is the Creator of everything?",
        options: ["Allah", "I don't know"],
        correct: 0,
        explanation: "Allah is Al-Khaliq, the Creator of all things in the universe."
      }
    ]
  },

  // Flower 7 (Pages 61-70)
  {
    id: 7,
    title: "Heavens & Humanity",
    subtitle: "Pages 61 – 70",
    icon: "🌾",
    questions: [
      {
        question: "Are there many heavens or only one?",
        options: ["Only one", "Many"],
        correct: 1,
        explanation: "Allah created seven heavens above us."
      },
      {
        question: "Allah created all people from how many person?",
        options: ["One", "Ten"],
        correct: 0,
        explanation: "All humanity was created from a single soul, Prophet Adam (peace be upon him)."
      },
      {
        question: "Allah created us inside whose womb?",
        options: ["Father", "Mother"],
        correct: 1,
        explanation: "Allah fashioned us inside our mothers' wombs with immense care."
      }
    ]
  },

  // Flower 8 (Pages 71-80)
  {
    id: 8,
    title: "True Religion & Guidance",
    subtitle: "Pages 71 – 80",
    icon: "🌼",
    questions: [
      {
        question: "What is the true religion of Allah?",
        options: ["I don't know", "Islam"],
        correct: 1,
        explanation: "Islam is the peaceful, true religion chosen by Allah for mankind."
      },
      {
        question: "Whose guidance is the true guidance?",
        options: ["Allah's Guidance", "I don't know"],
        correct: 0,
        explanation: "True guidance comes solely from Allah's words and teachings."
      },
      {
        question: "Can we give examples of Allah?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Nothing is like Allah; He is unique and beyond comparison."
      }
    ]
  },

  // Flower 9 (Pages 81-90)
  {
    id: 9,
    title: "Patience & Good Deeds",
    subtitle: "Pages 81 – 90",
    icon: "🌸",
    questions: [
      {
        question: "Will Allah be with those who are patient?",
        options: ["No", "Yes"],
        correct: 1,
        explanation: "Allah is with the patient (As-Sabirin) and rewards them immensely."
      },
      {
        question: "If we do good, who will love us?",
        options: ["Allah", "I don't know"],
        correct: 0,
        explanation: "Allah loves those who do good deeds (Al-Muhsinin)."
      },
      {
        question: "What is greater?",
        options: ["Playing all the time", "Remembering Allah"],
        correct: 1,
        explanation: "Remembering Allah is the greatest, most rewarding endeavor."
      }
    ]
  },

  // Flower 10 (Pages 91-100)
  {
    id: 10,
    title: "Cleanliness & Purity of Heart",
    subtitle: "Pages 91 – 100",
    icon: "💮",
    questions: [
      {
        question: "Will Allah love us if we keep ourselves clean?",
        options: ["I don't know", "Yes"],
        correct: 1,
        explanation: "Cleanliness is half of faith, and Allah loves those who keep clean."
      },
      {
        question: "Who knows what is in our hearts?",
        options: ["Allah", "A friend"],
        correct: 0,
        explanation: "Allah knows all secrets and thoughts hidden within our hearts."
      },
      {
        question: "Whose footsteps we should not follow?",
        options: ["Good people", "Shaitan"],
        correct: 1,
        explanation: "We must avoid following the whispers and footsteps of shaitan."
      }
    ]
  },

  // Flower 11 (Pages 101-110)
  {
    id: 11,
    title: "Prophets Adam & Musa",
    subtitle: "Pages 101 – 110",
    icon: "🌿",
    questions: [
      {
        question: "Who is our enemy?",
        options: ["I don't know", "Shaitan"],
        correct: 1,
        explanation: "shaitan (Shaitan) is an open enemy to humanity."
      },
      {
        question: "Whom did Allah teach the names of all things?",
        options: ["Adam", "Musa"],
        correct: 0,
        explanation: "Allah taught Prophet Adam (peace be upon him) the names of all things."
      },
      {
        question: "To whom did Allah speak directly?",
        options: ["Musa", "Ibrahim"],
        correct: 0,
        explanation: "Allah spoke directly to Prophet Musa (Kalimullah)."
      }
    ]
  },

  // Flower 12 (Pages 111-120)
  {
    id: 12,
    title: "Prophets Dawood & Sulayman",
    subtitle: "Pages 111 – 120",
    icon: "🍀",
    questions: [
      {
        question: "Which prophet received Zabur (Psalms)?",
        options: ["Yahya", "Dawood"],
        correct: 1,
        explanation: "Prophet Dawood (David) was given the holy book Zabur."
      },
      {
        question: "Who was the son of Dawud?",
        options: ["Yunus", "Sulayman"],
        correct: 1,
        explanation: "Prophet Sulayman (Solomon) was the wise son of Prophet Dawud."
      },
      {
        question: "Who should we obey for guidance?",
        options: ["The Messenger", "shaitan"],
        correct: 0,
        explanation: "We follow Allah's Messenger ﷺ for authentic guidance."
      }
    ]
  },

  // Flower 13 (Pages 121-130)
  {
    id: 13,
    title: "Prayers, Fasting & Charity",
    subtitle: "Pages 121 – 130",
    icon: "🌱",
    questions: [
      {
        question: "What should we take good care of?",
        options: ["Our prayers", "Our games"],
        correct: 0,
        explanation: "We must guard and take good care of our daily prayers (Salah)."
      },
      {
        question: "Is fasting in Ramadan a must for Muslims?",
        options: ["Yes", "No"],
        correct: 0,
        explanation: "Fasting during the holy month of Ramadan is one of the Five Pillars of Islam."
      },
      {
        question: "Is giving charity good for us?",
        options: ["Yes", "No"],
        correct: 0,
        explanation: "Giving Zakat and Sadaqah purifies our wealth and brings blessings."
      }
    ]
  },

  // Flower 14 (Pages 131-140)
  {
    id: 14,
    title: "Gentleness & Good Conduct",
    subtitle: "Pages 131 – 140",
    icon: "🌴",
    questions: [
      {
        question: "What kind of people should we stay away from?",
        options: ["Good people", "Foolish people"],
        correct: 1,
        explanation: "We should avoid foolish, harmful company and seek righteous friends."
      },
      {
        question: "How should we walk on the earth?",
        options: ["Proudly", "Gently"],
        correct: 1,
        explanation: "Believers walk upon the earth gently and humbly."
      },
      {
        question: "How should we keep our clothes?",
        options: ["Clean", "Dirty"],
        correct: 0,
        explanation: "Islam teaches us to keep our clothes clean, neat, and pure."
      }
    ]
  },

  // Flower 15 (Pages 141-150)
  {
    id: 15,
    title: "Good Words & No Waste",
    subtitle: "Pages 141 – 150",
    icon: "🌲",
    questions: [
      {
        question: "What should we encourage people to do?",
        options: ["Bad", "Good"],
        correct: 1,
        explanation: "We should always encourage others to perform good deeds."
      },
      {
        question: "How should we speak to people?",
        options: ["Rudely", "Nicely"],
        correct: 1,
        explanation: "Allah commands us to speak kindly and nicely to all people."
      },
      {
        question: "Is it allowed to waste food?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Wasting food is forbidden in Islam; we appreciate Allah's blessings."
      }
    ]
  },

  // Flower 16 (Pages 151-160)
  {
    id: 16,
    title: "Truthfulness & Parents",
    subtitle: "Pages 151 – 160",
    icon: "☘️",
    questions: [
      {
        question: "Can we help each other in sin and enmity?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "We cooperate in righteousness and piety, not in sin or hostility."
      },
      {
        question: "With whom should we always be?",
        options: ["Truthful people", "Liars"],
        correct: 0,
        explanation: "We should surround ourselves with truthful, honest people."
      },
      {
        question: "How should we treat our parents?",
        options: ["Good", "Bad"],
        correct: 0,
        explanation: "Treating parents with kindness, love, and respect is a major command in Islam."
      }
    ]
  },

  // Flower 17 (Pages 161-170)
  {
    id: 17,
    title: "Believers & Success",
    subtitle: "Pages 161 – 170",
    icon: "🌺",
    questions: [
      {
        question: "Worshipping anyone besides Allah is a big or small sin?",
        options: ["Big sin", "Small sin"],
        correct: 0,
        explanation: "Shirk (worshipping others besides Allah) is the biggest sin."
      },
      {
        question: "Who are successful?",
        options: ["Believers", "Disbelievers"],
        correct: 0,
        explanation: "The true believers who do good deeds are the successful ones."
      },
      {
        question: "Does Allah love those who spread mischief?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Allah does not love corruption or those who cause trouble."
      }
    ]
  },

  // Flower 18 (Pages 171-180)
  {
    id: 18,
    title: "Kind Names & No Backbiting",
    subtitle: "Pages 171 – 180",
    icon: "🌻",
    questions: [
      {
        question: "Is it allowed to make fun of others?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Making fun of others is forbidden in Islam."
      },
      {
        question: "What kind of names should we call each other?",
        options: ["Good names", "Bad names"],
        correct: 0,
        explanation: "We should address each other using good, respectful names."
      },
      {
        question: "Is backbiting allowed in Islam?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Backbiting (talking bad behind someone's back) is strictly forbidden."
      }
    ]
  },

  // Flower 19 (Pages 181-190)
  {
    id: 19,
    title: "Honesty & Avoiding Bad",
    subtitle: "Pages 181 – 190",
    icon: "🌷",
    questions: [
      {
        question: "What should we stay away from?",
        options: ["Good things", "Bad things"],
        correct: 1,
        explanation: "We must stay away from all bad deeds, harm, and evil."
      },
      {
        question: "Who will never succeed?",
        options: ["Criminals", "Good people"],
        correct: 0,
        explanation: "Those who do wrong and break Allah's laws will not succeed in the end."
      },
      {
        question: "Is it allowed to cheat people in Islam?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Cheating in trade, school, or daily life is forbidden in Islam."
      }
    ]
  },

  // Flower 20 (Pages 191-200)
  {
    id: 20,
    title: "Gospel, Qur'an & Night of Power",
    subtitle: "Pages 191 – 200",
    icon: "🌹",
    questions: [
      {
        question: "To whom did Allah give the Injeel?",
        options: ["Musa", "Isa"],
        correct: 1,
        explanation: "Allah revealed the Injeel to Prophet Isa."
      },
      {
        question: "Is the Qur'an easy or difficult to remember?",
        options: ["Easy", "Difficult"],
        correct: 0,
        explanation: "Allah has made the Holy Qur'an easy to remember and recite."
      },
      {
        question: "The Night of Power is better than how many months?",
        options: ["One hundred months", "One thousand months"],
        correct: 1,
        explanation: "Laylat al-Qadr (The Night of Power) is better than a thousand months."
      }
    ]
  },

  // Flower 21 (Pages 201-210)
  {
    id: 21,
    title: "Creation Bows to Allah",
    subtitle: "Pages 201 – 210",
    icon: "💐",
    questions: [
      {
        question: "What do the stars and the trees do?",
        options: ["Just sleep", "Bow down to Allah"],
        correct: 1,
        explanation: "All of creation, including stars and trees, prostrate to Allah."
      },
      {
        question: "Do the sun and the moon move perfectly or not?",
        options: ["Move perfectly", "Do not move perfectly"],
        correct: 0,
        explanation: "The sun and moon orbit in perfect harmony by Allah's divine decree."
      },
      {
        question: "In the verse, which is mentioned first: the day or the night?",
        options: ["The day", "The night"],
        correct: 1,
        explanation: "The night is mentioned first in the Quranic verse."
      }
    ]
  },

  // Flower 22 (Pages 211-220)
  {
    id: 22,
    title: "Wonders of Creation & Hereafter",
    subtitle: "Pages 211 – 220",
    icon: "🌾",
    questions: [
      {
        question: "Allah asks us to look at which animal and see how it was created?",
        options: ["The giraffe", "The camel"],
        correct: 1,
        explanation: "Surah Al-Ghashiyah asks us to ponder how the camel was created."
      },
      {
        question: "Is the reward in the Hereafter greater or smaller?",
        options: ["Greater", "Smaller"],
        correct: 0,
        explanation: "The eternal rewards of the Hereafter are far greater than earthly life."
      },
      {
        question: "Is Allah's earth very vast or small?",
        options: ["Vast", "Small"],
        correct: 0,
        explanation: "Allah's earth is vast, full of wonders and opportunities to do good."
      }
    ]
  },

  // Flower 23 (Pages 221-230)
  {
    id: 23,
    title: "Paradise & Hellfire",
    subtitle: "Pages 221 – 230",
    icon: "🌼",
    questions: [
      {
        question: "Where will good people be called to stay?",
        options: ["Paradise", "Hell"],
        correct: 0,
        explanation: "Righteous believers will be welcomed into Jannah (Paradise)."
      },
      {
        question: "Are the fruits in Paradise near or far?",
        options: ["Near", "Far"],
        correct: 0,
        explanation: "The delicious fruits of Paradise hang near and easy to reach."
      },
      {
        question: "Is the fire of Hell cold or very hot?",
        options: ["Cold", "Very hot"],
        correct: 1,
        explanation: "The fire of Hell is extremely hot; we seek refuge with Allah from it."
      }
    ]
  },

  // Flower 24 (Pages 231-234)
  {
    id: 24,
    title: "Flowers of the Qur'an Completion",
    subtitle: "Pages 231 – 234",
    icon: "✨",
    questions: [
      {
        question: "We should always ask Allah to keep us among good people or bad people?",
        options: ["Good people", "Bad people"],
        correct: 0,
        explanation: "We pray to Allah to place us amongst the righteous and good people."
      },
      {
        question: "How many Flowers of the Qur'an did we read in the book Flowers of the Qur'an?",
        options: ["234", "250"],
        correct: 0,
        explanation: "We learned 234 beautiful Quranic lessons in the book."
      },
      {
        question: "What should we do after understanding the Qur'an?",
        options: ["Practise it", "Ignore it"],
        correct: 0,
        explanation: "We must put Quranic teachings into practice in our daily lives!"
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FLOWERS_DATA };
}
