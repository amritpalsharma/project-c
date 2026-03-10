import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TermsComponent implements OnInit {
  banner_title: any = null;
  page_content: any = null;
  banner_img: any = null;
  base_url: any = null;
  advertisemnet_base_url: string = '';
  advertisemnet_new_base_url: string = '';
  accordionDataTerms: any = [];

  isLoading: boolean = true;
  btnLoading: boolean = false;
  countdown: number = 10;


  adVisible: boolean[] = [true, true, true]; // Array to manage ad visibility
  constructor(private translateService: TranslateService, private webPages: WebPages, private sanitizer: DomSanitizer) {

  }
  ngOnInit() {
    // Initially, all ads are visible
    // this.adVisible = [true, true, true];
    this.adVisible = [false, false, false];
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
    });
  }

  advertisementList: any = null;

  isActive: any = {
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard: true,
    banner: true,
    square: true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }
  advertisementData: any = {
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

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('terms_and_conditions', languageId).subscribe((res) => {
      if (res.status) {
        console.warn('response', res);
        this.banner_title = res.data.pageData.banner_title;
        this.page_content = this.sanitizer.bypassSecurityTrustHtml(res.data.pageData.page_content);
        this.banner_img = res.data.pageData.banner_img;
        this.base_url = res.data.base_url;
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisemnet_new_base_url = res.data.advertisemnet_new_base_url;
        this.advertisementData = res?.data?.advertisementData;
        this.advertisementList = res?.data?.allAdsList;
        if (res?.data?.pageData?.accordionDataTerms && typeof res?.data?.pageData?.accordionDataTerms !== undefined) {
          this.accordionDataTerms = JSON.parse(res?.data?.pageData?.accordionDataTerms);
        }
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

  closeAd(object: any) {

    this.isActive[object] = false;

  }


  isEmptyObject(obj: any) {
    if (typeof obj != 'undefined') {
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

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }
  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  async downloadPDf(type: string) {
    let src = '../assets/pdf/'
    let name;
    let key;
    if (type == 'terms') {
      src += 'terms/';
      name = 'Terms & Conditions';
      key = 'Terms_Conditions';
    } else if (type == 'community') {
      src += 'community_guidelines/';
      name = 'Community Guidelines';
      key = 'Community_Guidelines_2025';
    } else if (type == 'privacy_policy') {
      src += 'privacy_policy/';
      name = 'Privacy Policy';
      key = 'Privacy_Policy';
    }

    try {
      let lang = localStorage.getItem('lang');
      src += lang + '_' + key + '.pdf';
      const tld = window.location.hostname.split('.').slice(-1)[0];
      console.log('tld', tld)
      let countryName = '';
      let privacyPDF = '';
      let termsPDF = '';
      // if (tld == 'ch' || tld == 'de'|| tld == 'at') {
      //   countryName = 'Schweiz_Deutschland';
      //   privacyPDF = 'Allgemeine Datenschutzerklärung Succer You Sports AG_2025_Schweiz_Deutschland.pdf';
      //   termsPDF = 'AGB_SoccerYou_Schweiz_Deutschland_2025.pdf';
      // } else if (tld == 'it') {
      //   countryName = 'Italia';
      //   termsPDF = 'Termini_Condizioni_SoccerYou_Italia_2025.pdf';
      //   privacyPDF = 'Informativa generale sulla privacy Italila Succer You Sports AG_2025.pdf';
      // } else if (tld == 'fr' || tld == 'be') {
      //   countryName = 'France_Belgique';
      //   termsPDF = 'CGU_SoccerYou_France_Belgique_2025.pdf';
      //   privacyPDF = 'Déclaration générale de protection des données Succer You Sports AG_2025_France_Belgique.pdf';
      // } else if (tld == 'uk' || tld == 'org' || tld == 'al') {
      //   countryName = 'England';
      //   termsPDF = 'Terms_Conditions_SoccerYou_England_2025.pdf';
      //   privacyPDF = 'General data protection declaration England Succer You Sports AG_2025.pdf';
      // } else if (tld == 'es') {
      //   countryName = 'España';
      //   termsPDF = 'Normas_Comunitairas_SoccerYou_Espagna_2025.pdf';
      //   privacyPDF = 'Política general de privacidad Espagnia Succer You Sports AG_2025.pdf';
      // } else if (tld == 'pt') {
      //   countryName = 'Portugal';
      //   termsPDF = 'Termos_Condicoees_SoccerYou_Portugal_2025.pdf';
      //   privacyPDF = 'Política geral de privacidade Portugal Succer You Sports AG_2025.pdf';
      // } else if (tld == 'dk') {
      //   countryName = 'Danmark';
      //   termsPDF = 'Vilkaer_Betingelser_SoccerYou_Danmark_2025.pdf';
      //   privacyPDF = 'Generel privatlivspolitik Danmark Succer You Sports AG_2025.pdf';
      // } else if (tld == 'se') {
      //   countryName = 'Sverige';
      //   termsPDF = 'Allmaenna_villkor_SoccerYou_Sverige_2025.pdf';
      //   privacyPDF = 'Allmän integritetspolicy Sverige Succer You Sports AG_2025.pdf';
      // }

      if (tld == 'ch' || tld == 'de') {
        countryName = 'Schweiz_Deutschland';
        privacyPDF = 'Allgemeine Datenschutzerklärung Succer You Sports AG_2025_Schweiz_Deutschland.pdf';
        termsPDF = 'AGB SoccerYou Schweiz_Deutschland 2025.pdf';
      } else if (tld == 'it') {
        countryName = 'Italia';
        termsPDF = 'Termini & Condizioni SoccerYou Italia 2025.pdf';
        privacyPDF = 'Informativa generale sulla privacy Italila Succer You Sports AG_2025.pdf';
      } else if (tld == 'fr' || tld == 'be') {
        countryName = 'France_Belgique';
        termsPDF = 'CGU SoccerYou France_Belgique 2025.pdf';
        privacyPDF = 'Déclaration générale de protection des données Succer You Sports AG_2025_France_Belgique.pdf';
      } else if (tld == 'uk') {
        countryName = 'England';
        termsPDF = 'Terms & Conditions SoccerYou England 2025.pdf';
        privacyPDF = 'General data protection declaration England Succer You Sports AG_2025.pdf';
      } else if (tld == 'es') {
        countryName = 'España';
        termsPDF = 'Normas Comunitairas SoccerYou Espagna 2025.pdf';
        privacyPDF = 'Política general de privacidad Espagnia Succer You Sports AG_2025.pdf';
      } else if (tld == 'pt') {
        countryName = 'Portugal';
        termsPDF = 'Termos & Condições SoccerYou Portugal 2025.pdf';
        privacyPDF = 'Política geral de privacidade Portugal Succer You Sports AG_2025.pdf';
      } else if (tld == 'dk') {
        countryName = 'Danmark';
        termsPDF = 'Vilkår & Betingelser SoccerYou Danmark 2025.pdf';
        privacyPDF = 'Generel privatlivspolitik Danmark Succer You Sports AG_2025.pdf';
      } else if (tld == 'se') {
        countryName = 'Sverige';
        termsPDF = 'Allmänna villkor SoccerYou Sverige 2025.pdf';
        privacyPDF = 'Allmän integritetspolicy Sverige Succer You Sports AG_2025.pdf';
      } else if (tld == 'al') {
        countryName = 'Albania';  //english
        privacyPDF = 'General data protection declaration Albania Succer You Sports AG_2025.pdf';
        termsPDF = 'Terms & Conditions SoccerYou Albania 2025.pdf';
      } else if (tld == 'org') {
        countryName = 'Kosovo'; //english
        privacyPDF = 'General data protection declaration Kosovo Succer You Sports AG_2025.pdf';
        termsPDF = 'Terms & Conditions SoccerYou Kosovo 2025.pdf';
      } else if (tld == 'at') {
        countryName = 'Austria'; // detuch
        privacyPDF = 'General data protection declaration Austria Succer You Sports AG_2025.pdf';
        termsPDF = 'Terms & Conditions SoccerYou Austria 2025.pdf';
      }
      let pdfName = '';
      if (type == 'community') {
        pdfName = 'SoccerYou ' + countryName + '_Community Guidelines_2025.pdf';
        src = '../assets/pdf/communityNew/' + pdfName;
      }
      if (type == 'privacy_policy') {
        pdfName = privacyPDF;
        src = '../assets/pdf/privacy/' + privacyPDF;
      }
      if (type == 'terms') {
        pdfName = termsPDF;
        // src = '../assets/pdf/terms/' + termsPDF;
        src = '../assets/pdf/newTerms/' + termsPDF;
      }

      // alert(type);
      console.log('src', src)
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob(); // Convert the response to a Blob object
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = pdfName; // Set the filename for download
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }
}
