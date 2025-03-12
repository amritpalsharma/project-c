import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  selectedTab: string = 'talent'; // Default tab
  faq_banner_title:string='';
  faq_collapse_titile:string='';
  faq_first_btn_txt:string='';
  faq_sec_btn_txt:string='';
  faq_third_btn_txt:string='';
  advertisemnet_base_url:string= '';

  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;

  
  isOpen: { [key: string]: boolean[] } = {
    talent: [],
    club: [],
    scout: []
  };

  constructor( private webPages: WebPages){ 
    this.initializeIsOpen();
  
  }
  advertisementList: any= null;

  isActive : any ={
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard:true,
    banner: true,
    square:true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }
  advertisementData:any = {
    skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    wide_skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    banner: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    small_square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    inline_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
  }

  ngOnInit() {
    // this.adVisible = [true, true, true, true, true, true, true];

    this.adVisible = [false, false, false, false, false, false, false];
  
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
    });
  }

  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('faq',languageId).subscribe((res) => {
      if(res.status){
          this.faq_banner_title  = res.data.pageData.faq_banner_title;
          this.faq_collapse_titile = res.data.pageData.faq_collapse_titile;
          this.faq_first_btn_txt = res.data.pageData.faq_first_btn_txt;
          this.faq_sec_btn_txt= res.data.pageData.faq_sec_btn_txt;
          this.faq_third_btn_txt= res.data.pageData.faq_third_btn_txt;
          this.talentSections = res.data.pageData.faq_first_btn_content; //this.faq_first_btn_content
           this.clubSections = res.data.pageData.faq_sec_btn_content;
           this.scoutSections = res.data.pageData.faq_third_btn_content;
           this.advertisementData = res?.data?.advertisementData;
           this.advertisementList = res?.data?.allAdsList;

           this.advertisemnet_base_url = res.data.advertisemnet_base_url;

           this.isLoading = false;
           this.startCountdown();
          
        }
    });
  }

  startCountdown() {
    this.countdown = 5; // Reset countdown
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.btnLoading = false; // Stop loading when countdown reaches 0
      }
    }, 1000);
  }
  // Sections for each tab
  talentSections:any = [
    // {
    //   title: 'What is Soccer?',
    //   desc: `Soccer, also known as football in most countries outside of the United States and Canada, is a popular team sport played between two teams of eleven players each. The game is played on a rectangular field with a goal at each end. The objective is to score by getting a ball into the opposing team's goal. Players primarily use their feet to move the ball, but they can also use their head or torso. The goalkeeper is the only player allowed to use their hands and arms, but only within the penalty area surrounding the goal.`,
    //   content2: `Soccer is governed by a set of rules known as the Laws of the Game, which include regulations on the field's dimensions, the ball, the duration of the match, and the roles of the players.`
    // },
    // {
    //   title: 'How can I create a profile on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What are the benefits of a premium membership?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How do I connect with clubs and scouts on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Can I upload highlight videos and match reports to my profile?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How does SoccerYou ensure the credibility of profiles?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Is SoccerYou available in multiple languages?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What kind of support does SoccerYou offer?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How can clubs and scouts benefit from SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What security measures does SoccerYou have in place?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
  ];

  clubSections:any = [
    // {
    //   title: 'What is Soccer?',
    //   desc: `Soccer, also known as football in most countries outside of the United States and Canada, is a popular team sport played between two teams of eleven players each. The game is played on a rectangular field with a goal at each end. The objective is to score by getting a ball into the opposing team's goal. Players primarily use their feet to move the ball, but they can also use their head or torso. The goalkeeper is the only player allowed to use their hands and arms, but only within the penalty area surrounding the goal.`,
    //   content2: `Soccer is governed by a set of rules known as the Laws of the Game, which include regulations on the field's dimensions, the ball, the duration of the match, and the roles of the players.`
    // },
    // {
    //   title: 'How can I create a profile on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What are the benefits of a premium membership?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How do I connect with clubs and scouts on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Can I upload highlight videos and match reports to my profile?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How does SoccerYou ensure the credibility of profiles?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Is SoccerYou available in multiple languages?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What kind of support does SoccerYou offer?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How can clubs and scouts benefit from SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What security measures does SoccerYou have in place?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
  ];

  scoutSections:any = [
    // {
    //   title: 'What is Soccer?',
    //   desc: `Soccer, also known as football in most countries outside of the United States and Canada, is a popular team sport played between two teams of eleven players each. The game is played on a rectangular field with a goal at each end. The objective is to score by getting a ball into the opposing team's goal. Players primarily use their feet to move the ball, but they can also use their head or torso. The goalkeeper is the only player allowed to use their hands and arms, but only within the penalty area surrounding the goal.`,
    //   content2: `Soccer is governed by a set of rules known as the Laws of the Game, which include regulations on the field's dimensions, the ball, the duration of the match, and the roles of the players.`
    // },
    // {
    //   title: 'How can I create a profile on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What are the benefits of a premium membership?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How do I connect with clubs and scouts on SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Can I upload highlight videos and match reports to my profile?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How does SoccerYou ensure the credibility of profiles?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'Is SoccerYou available in multiple languages?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What kind of support does SoccerYou offer?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'How can clubs and scouts benefit from SoccerYou?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
    // {
    //   title: 'What security measures does SoccerYou have in place?',
    //   desc: `SoccerYou is a platform dedicated to soccer enthusiasts. It offers various features and information to help users stay engaged with the sport.`,
    //   content2: `On SoccerYou, you can find news, match updates, player statistics, and more. It's designed to enhance your soccer experience and keep you connected with the latest in the game.`
    // },
  ];



  // Initialize isOpen array based on the number of sections in each tab
  initializeIsOpen() {
    this.isOpen['talent'] = new Array(this.talentSections.length).fill(false);
    this.isOpen['club'] = new Array(this.clubSections.length).fill(false);
    this.isOpen['scout'] = new Array(this.scoutSections.length).fill(false);
  }

  // Toggle the visibility of content for a specific section
  toggleContent(index: number) {
    const currentSections = this.getCurrentSections();
    this.isOpen[this.selectedTab][index] = !this.isOpen[this.selectedTab][index];
  }

  // Get the current sections based on the selected tab
  getCurrentSections() {
    switch (this.selectedTab) {
      case 'club':
        return this.clubSections;
      case 'scout':
        return this.scoutSections;
      case 'talent':
      default:
        return this.talentSections;
    }
  }

  // Change the selected tab and reinitialize isOpen array
  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.initializeIsOpen();
  }
 
  adVisible: boolean[] = [true, true, true, true, true, true, true]; // Array to manage ad visibility
  
  // closeAd(index: number) {
  //   this.adVisible[index] = false; // Set the specific ad to not visible based on index
  // }

  closeAd(object: any) {

    this.isActive[object] = false;

  }
  

  isEmptyObject(obj:any) {
    if(typeof obj != 'undefined'){
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
  }
  openModal(modalId: string) {
    console.log(`Open modal: ${modalId}`);
    // Implement modal opening logic here
  }

  checkActive(obj: any) {
    if (this.isExists(obj) && this.isFeaturedImageExists(obj) && this.isActive[obj]) {
      return true;
    }
    return false;
  }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }
}
