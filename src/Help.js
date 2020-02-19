import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {FiArrowLeft, FiPlayCircle, FiMoreVertical, FiMenu} from 'react-icons/fi';
import {FaUsers, FaUserEdit, FaRegCalendarPlus, FaRegCalendarAlt} from 'react-icons/fa';
import {MdSwapVert} from 'react-icons/md';
import appData from './Utils/AppData';
import {config, appNav} from './Utils';

const Help = () => {
  let ver = config.version.toFixed(1);
  return (
    <div className="pad">
      <h2>Sekretny zeszycik <span style={{fontSize:'0.6em'}}>(ver. {ver})</span></h2>
      <p style={{textAlign:'right',margin:'-0.6em 15% 0.7em 0'}}>
        &copy; {new Date().getFullYear()} <a href="http://piechnat.pl/article/zyciorys.html">
          Mateusz Piechnat</a>
      </p>
      <p>
        Aplikacja dla nauczycieli akademickich do kontrolowania liczby zajęć indywidualnych,
        przepracowanych ze studentami zgodnie z&nbsp;przydziałem semestralnym.
      </p>
      <p>
        Nazwa <em>sekretny zeszycik</em> została sformułowana podczas dyskusji na zebraniu 
        akompaniatorów w&nbsp;Akademii Muzycznej w&nbsp;Łodzi (2.&nbsp;października 2019) 
        i&nbsp;ma charakter humorystyczny.
      </p>
      {!appNav.pwaMode&&<div>
        <h3>Instalacja w urządzeniu mobilnym</h3>
        <p>
          <b>Secret Notebook</b> można zainstalować poprzez dodanie jego ikony do ekranu głównego 
          w&nbsp;smartfonie lub tablecie. W&nbsp;tym celu:
        </p>
        <ol>
          <li>
            Upewnij się, że niniejsza strona jest otwarta w&nbsp;domyślnej przeglądarce internetu 
            (np. <em>Chrome</em>, <em>Safari</em>, <em>Samsung Internet</em>, <em>Opera</em>).
            W&nbsp;przeciwnym wypadku z&nbsp;menu <nobr>(<FiMoreVertical/>)</nobr> wybierz 
            opcję <em>Otwórz w&nbsp;aplikacji...</em>
          </li>
          <li>
            Jeśli nie widzisz dedykowanego przycisku instalacji, to 
            z&nbsp;menu <nobr>(<FiMoreVertical/>lub <FiMenu/> )</nobr> wybierz 
            opcję <a href="https://www.youtube.com/watch?v=AVTAtA01Tkc"><em>
            Dodaj do ekranu głównego</em></a> (nazwa może różnić się w&nbsp;zależności od 
            używanej przeglądarki stron, np. w&nbsp;<em>Safari/iOS</em> należy kliknąć ikonę <em>
            Udostępnij</em>, a następnie pozycję <em>Do ekranu początkowego</em>). 
          </li>
        </ol>
        <p>
          Poprawnie zainstalowana aplikacja otwiera się w&nbsp;trybie pełnoekranowym 
          (bez paska adresu).
        </p>
      </div>}
      <h3>Pomoc</h3>
      <p>
        <b>Secret Notebook</b> nie wymaga połączenia z&nbsp;Internetem. Przechowuje dane lokalnie 
        w&nbsp;urządzeniu, z&nbsp;którego obecnie korzystasz. Jeśli włączysz go na innym 
        urządzeniu (lub w&nbsp;innej przeglądarce stron), nie będziesz mieć dostępu do danych, 
        które wprowadzisz tutaj.
      </p>
      {!appNav.pwaMode&&<p>
        Uruchamianie aplikacji poprzez kliknięcie ikony na ekranie głównym gwarantuje każdorazowy 
        dostęp do danych z tej samej przeglądarki.
      </p>}
      <p>
        Dane można przenieść do innego urządzenia (lub przeglądarki) za pomocą mechanizmu 
        eksportowania i&nbsp;importowania w&nbsp;<Link to="/settings">ustawieniach</Link>.
      </p>
      <p>
        Wszelkie pytania i uwagi odnośnie działania lub rozbudowy <b>Secret Notebook
        </b> można kierować na adres: <a href={'mailto:mateusz@piechnat.pl?'+
        'subject=Secret%20Notebook%20v'+ver+'%20-%20'+encodeURIComponent(navigator.userAgent)}>
        mateusz@piechnat.pl</a>
      </p>
      <h3>Wersja demonstracyjna</h3>
      <p><button onClick={()=>appNav.push('/demo')}><FiPlayCircle/>Rozpocznij</button></p>
      <p>
        Niniejsza opcja wprowadza do aplikacji przykładowe dane 
        (fikcyjne nazwiska i&nbsp;terminy zajęć), dzięki którym szybko zapoznasz się 
        z&nbsp;działaniem <em>sekretnego zeszyciku</em>. Dane te można później usunąć za pomocą 
        przycisku <em>Usuń wszystko</em> w&nbsp;<Link to="/settings">ustawieniach</Link>.
      </p>
      <h3>Nawigacja</h3>
      <p>
        <FaUsers/> Studenci – kliknięcie obszaru studenta na liście otwiera widok 
        jego zajęć. Przyciśnięcie ikony&nbsp;<FiArrowLeft/> lub <em>przeciągnięcie w&nbsp;lewo
        </em> otwiera menu skrótów: 
        <span style={{display:'block',margin:'0.5em 0 0 1em'}}>
          <FaRegCalendarPlus/> – dodaje lekcję o&nbsp;wybranej długości 
            z&nbsp;aktualną datą i&nbsp;godziną,<br/>
          <FaUserEdit/> – otwiera widok edycji studenta,<br/>
          <MdSwapVert/> – przesuwa pozycję studenta na liście (opcja dostępna jeśli 
            w&nbsp;ustawieniach sortowania wybrano <em>własne uszeregowanie</em>).
        </span>
      </p>
      <p>
        <FaRegCalendarAlt/> Zajęcia – kliknięcie obszaru lekcji na liście  otwiera 
        widok edycji lekcji.
      </p>
      <p>
        Kliknięcie nazwy <b>Secret Notebook</b> w&nbsp;nagłówku 
        wywołuje powrót do widoku listy studentów.
      </p>
    </div>
  )
} 

export default Help;

export const Demo = () => {
  useEffect(() => {
    appData.importFromJSON(String.raw`
      {"nextId":"109","SLO_108":"{\"title\":\"Agnieszka Nowak-Dąbrowska\",\"totalHours\":24,\"completed\":765,\"lessonLength\":90,\"lessons\":[{\"time\":1570457700000,\"length\":90},{\"time\":1571062500000,\"length\":90},{\"time\":1572275700000,\"length\":75},{\"time\":1572880500000,\"length\":90},{\"time\":1574090100000,\"length\":75},{\"time\":1574694900000,\"length\":90},{\"time\":1575299700000,\"length\":75},{\"time\":1575904500000,\"length\":90},{\"time\":1576509300000,\"length\":90}],\"id\":108}","SLO_107":"{\"title\":\"Krzysztof Kowalczyk\",\"totalHours\":24,\"completed\":975,\"lessonLength\":45,\"lessons\":[{\"time\":1570183200000,\"length\":45},{\"time\":1570631400000,\"length\":45},{\"time\":1570788000000,\"length\":45},{\"time\":1571236200000,\"length\":45},{\"time\":1571392800000,\"length\":45},{\"time\":1572449400000,\"length\":45},{\"time\":1573054200000,\"length\":45},{\"time\":1573210800000,\"length\":45},{\"time\":1573659000000,\"length\":45},{\"time\":1573815600000,\"length\":45},{\"time\":1574263800000,\"length\":75},{\"time\":1574420400000,\"length\":45},{\"time\":1574506800000,\"length\":45},{\"time\":1574868600000,\"length\":45},{\"time\":1575473400000,\"length\":45},{\"time\":1575630000000,\"length\":45},{\"time\":1576078200000,\"length\":90},{\"time\":1576234800000,\"length\":45},{\"time\":1576683000000,\"length\":45},{\"time\":1576839600000,\"length\":45}],\"id\":107}","SLO_102":"{\"title\":\"Katarzyna Kamińska\",\"totalHours\":12,\"completed\":375,\"lessonLength\":60,\"lessons\":[{\"time\":1570177800000,\"length\":45},{\"time\":1570782600000,\"length\":45},{\"time\":1573205400000,\"length\":45},{\"time\":1573810200000,\"length\":45},{\"time\":1574415000000,\"length\":45},{\"time\":1574501400000,\"length\":45},{\"time\":1575623700000,\"length\":45},{\"time\":1576229400000,\"length\":60}],\"id\":102}","SLO_104":"{\"title\":\"Maria Wójcik-Kozłowska\",\"totalHours\":12,\"completed\":315,\"lessonLength\":60,\"lessons\":[{\"time\":1570463100000,\"length\":45},{\"time\":1572281100000,\"length\":45},{\"time\":1572885900000,\"length\":60},{\"time\":1575476100000,\"length\":45},{\"time\":1575909900000,\"length\":60},{\"time\":1576514700000,\"length\":60}],\"id\":104}","SLO_103":"{\"title\":\"Andrzej Szymański\",\"totalHours\":12,\"completed\":450,\"lessonLength\":45,\"lessons\":[{\"time\":1570628700000,\"length\":45},{\"time\":1571233500000,\"length\":45},{\"time\":1572446700000,\"length\":45},{\"time\":1573051500000,\"length\":45},{\"time\":1573656300000,\"length\":45},{\"time\":1574261100000,\"length\":45},{\"time\":1574865900000,\"length\":45},{\"time\":1575470700000,\"length\":45},{\"time\":1576075500000,\"length\":45},{\"time\":1576680300000,\"length\":45}],\"id\":103}","SLO_105":"{\"title\":\"Tomasz Lewandowski\",\"totalHours\":12,\"completed\":360,\"lessonLength\":45,\"lessons\":[{\"time\":1571395500000,\"length\":45},{\"time\":1573213500000,\"length\":45},{\"time\":1573818300000,\"length\":45},{\"time\":1574423100000,\"length\":45},{\"time\":1574509500000,\"length\":45},{\"time\":1575632700000,\"length\":45},{\"time\":1576237500000,\"length\":45},{\"time\":1576842300000,\"length\":45}],\"id\":105}","SLO_101":"{\"title\":\"Jan Kowalski\",\"totalHours\":12,\"completed\":330,\"lessonLength\":45,\"lessons\":[{\"time\":1571230800000,\"length\":45},{\"time\":1572444000000,\"length\":45},{\"time\":1573652700000,\"length\":60},{\"time\":1574258400000,\"length\":45},{\"time\":1574863200000,\"length\":45},{\"time\":1576072800000,\"length\":45},{\"time\":1576677600000,\"length\":45}],\"id\":101}","SLO_106":"{\"title\":\"Anna Woźniak\",\"totalHours\":18,\"completed\":652.5,\"lessonLength\":22.5,\"lessons\":[{\"time\":1570180500000,\"length\":22.5},{\"time\":1570455000000,\"length\":45},{\"time\":1570785300000,\"length\":22.5},{\"time\":1571059800000,\"length\":45},{\"time\":1571390100000,\"length\":22.5},{\"time\":1572273000000,\"length\":45},{\"time\":1572877800000,\"length\":45},{\"time\":1573208100000,\"length\":22.5},{\"time\":1573812900000,\"length\":22.5},{\"time\":1574087400000,\"length\":45},{\"time\":1574417700000,\"length\":45},{\"time\":1574504100000,\"length\":22.5},{\"time\":1574692200000,\"length\":45},{\"time\":1575297000000,\"length\":45},{\"time\":1575627300000,\"length\":22.5},{\"time\":1575901800000,\"length\":45},{\"time\":1576232100000,\"length\":22.5},{\"time\":1576506600000,\"length\":45},{\"time\":1576836900000,\"length\":22.5}],\"id\":106}"}
    `);
    setTimeout(() => appNav.goHome(), 1);
  }, []);
  return '';
}