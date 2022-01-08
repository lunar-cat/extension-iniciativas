/* global chrome */
const getIniciativas = () => {
  const iniciativasContenedor = document.querySelector("#iniciativas");
  if (!iniciativasContenedor) return;
  let iniciativas = Array.from(iniciativasContenedor.children);
  iniciativas = iniciativas.map(ini => {
    const n = ini.children['1'].textContent.replace(/[^0-9]/g, '');
    let v = ini.children['5'].textContent;
    const isK = /[0-9]*\.?[0-9]*[kK]/g.test(v);
    if (isK) {
      const hasPoint = /\./g.test(v);
      if (hasPoint) {
        const [pre, post] = v.split('.');
        const value = (+pre.replace(/[^0-9]/g, '') * 1000) + (+post.replace(/[^0-9]/g, '') * 100);
        v = value;
      } else {
        const value = (+v.replace(/[^0-9]/g, '') * 1000);
        v = value;
      };
    } else {
      v = +v.replace(/[^0-9]/g, '');
    };
    return {
      titulo: ini.children['0'].textContent,
      numeroPropuesta: +n,
      categoria: ini.children['2'].textContent,
      resumen: ini.children['3'].textContent,
      autor: ini.children['4'].textContent,
      votos: v,
      votosFormat: new Intl.NumberFormat('es-cl').format(v),
      href: `o/${n}`,
    }
  });
  return iniciativas;
};

const replaceIniciativasParent = () => {
  const iniciativasParent = document.querySelector("#iniciativas");
  const body = document.querySelector("#body");
  if (!iniciativasParent) return;
  body.removeChild(iniciativasParent);
  const newIniciativas = document.createElement("div");
  const style = {
    display: "flex", width: "100%", height: "fit-content",
    alignItems: "center", justifyContent: "center", flexWrap: "wrap"
  };
  newIniciativas.id = "iniciativas";
  Object.entries(style).forEach(([k, v]) => newIniciativas.style[k] = v);
  body.appendChild(newIniciativas);
};

const populateWithNewIniciativas = (iniciativas, sortType) => {
  const iniciativasContenedor = document.querySelector("#iniciativas");
  if (!iniciativasContenedor || !iniciativas || !["ASC", "DESC"].includes(sortType)) return;
  sortType === "ASC" && iniciativas.sort((a, b) => a.votos - b.votos);
  sortType === "DESC" && iniciativas.sort((a, b) => b.votos - a.votos);
  const categoryColors = {
    "1": "95", "2": "12", "3": "289", "4": "206", "5": "178", "6": "123", "7": "40"
  };
  iniciativas.forEach(node => {
    const card = document.createElement("div");
    card.classList.add("card", "iniciativa", "estado");
    card.dataset.apoyos = node.votos;
    card.dataset.categoria = node.categoria[0];

    const titulo = document.createElement("h1");
    const tituloHref = document.createElement("a");
    tituloHref.href = node.href;
    tituloHref.textContent = node.titulo;
    titulo.appendChild(tituloHref);

    const subtitulo = document.createElement("h2");
    subtitulo.textContent = `Propuesta n° ${node.numeroPropuesta}`;

    const categoria = document.createElement("div");
    categoria.textContent = node.categoria;
    const color = categoryColors[node.categoria[0]];
    categoria.classList.add("pill", "rainbow", `rainbow-${color}`);

    const resumen = document.createElement("p");
    resumen.textContent = node.resumen;

    const autor = document.createElement("div")
    autor.textContent = node.autor;
    autor.classList.add("autor");

    const icon = document.createElement("i");
    icon.classList.add("fa", "fa-heart");

    const button = document.createElement("a");
    button.classList.add("boton");
    button.href = node.href;
    button.textContent = "Ver Iniciativa";

    const opciones = document.createElement("div");
    opciones.classList.add("opciones");
    opciones.textContent = `${node.votosFormat} `;
    opciones.appendChild(icon);
    opciones.appendChild(button);

    const toAppend = [titulo, subtitulo, categoria, resumen, autor, opciones];
    toAppend.forEach(ele => card.appendChild(ele));
    iniciativasContenedor.appendChild(card);
  });
  iniciativasContenedor.dataset.modified = true;
};

const attachEventsToFilters = () => {
  const filtros = ["gobierno", "principios", "estado", "derechos", "medio_ambiente", "justicia", "conocimiento"];
  const categoryColors = {
    "1": "95", "2": "12", "3": "289", "4": "206", "5": "178", "6": "123", "7": "40"
  };
  const textCategory = {
    "1": "1 - Sobre Sistema Político, Gobierno, Poder Legislativo y Sistema Electoral",
    "2": "2 - Sobre Principios Constitucionales, Democracia, Nacionalidad y Ciudadanía",
    "3": "3 - Forma de Estado, Ordenamiento, Autonomía, Descentralización, Equidad, Justicia Territorial, Gobiernos Locales y Organización Fiscal",
    "4": "4 - Derechos Fundamentales",
    "5": "5 - Medio Ambiente, Derechos de la Naturaleza, Bienes Naturales Comunes y Modelo Económico",
    "6": "6 - Sistema de Justicia, Órganos Autónomos de Control y Reforma Constitucional",
    "7": "7 - Sistemas de Conocimientos, Culturas, Ciencia, Tecnología, Artes y Patrimonios"
  }
  const parent = document.querySelector(".comisiones");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  };
  const iniciativasParent = document.querySelector("#iniciativas");
  const iniciativas = Array.from(iniciativasParent.children);

  filtros.forEach((filtro, idx) => {
    const ele = document.createElement("li");
    ele.classList.add("filtro", filtro);
    const div = document.createElement("div");
    div.textContent = textCategory[idx + 1];
    div.classList.add("pill", "rainbow", `rainbow-${categoryColors[idx + 1]}`);
    div.dataset.categoria = idx + 1;
    ele.style.padding = "2px";

    div.style.cursor = "pointer";
    div.style.opacity = "0.7";
    ele.appendChild(div);
    parent.appendChild(ele);

    div.addEventListener("click", e => {
      const categoria = e.target.dataset.categoria;
      const status = e.target.dataset.status;
      iniciativas.forEach(ini => ini.classList.remove("invisible"));
      if (status === "active") {
        e.target.style.opacity = "0.7";
        e.target.dataset.status = "inactive";
      } else {
        const otherFilter = document.querySelectorAll(".filtro div");
        Array.from(otherFilter).forEach(filter => {
          filter.dataset.status = "inactive";
          filter.style.opacity = "0.7";
        });
        e.target.style.opacity = "1";
        e.target.dataset.status = "active";
        iniciativas.forEach(ini => {
          if (ini.dataset.categoria !== categoria) {
            ini.classList.add("invisible");
          };
        });
      };
    });
  });
};

const main = (sortType = "DESC") => {
  const iniciativasContenedor = document.querySelector("#iniciativas");
  if (iniciativasContenedor.dataset.modified === "true") {
    console.log("ya modificado");
    return;
  };
  const oldIni = getIniciativas();
  replaceIniciativasParent();
  populateWithNewIniciativas(oldIni, sortType);
  attachEventsToFilters();
  const filtrosParent = document.querySelector(".comisiones");
  const ele = document.createElement("div");
  const parent = document.createElement("div");
  parent.style.display = "flex";
  parent.style.justifyContent = "center";
  parent.style.alignItems = "center";
  
  ele.classList.add("filtro");
  ele.style.padding = "8px";
  ele.style.borderRadius = "4px";
  ele.textContent = "Cambiar Orden";
  ele.style.cursor = "pointer";
  ele.style.backgroundColor = "purple";
  ele.style.color = "white";
  ele.style.width = "fit-content";
  const sort = () => {
    const iniciativasParent = document.querySelector("#iniciativas");
    iniciativasParent.style.flexWrap = (iniciativasParent.style.flexWrap === "wrap") ? "wrap-reverse" : "wrap";
  };
  parent.appendChild(ele);
  filtrosParent.appendChild(parent);
  ele.addEventListener("click", sort);
};

const sendChromeScript = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url = tab.url;
  if (!/.*\:\/\/iniciativas.chileconvencion.cl\/m\/iniciativa_popular\/.*/g.test(url)) return;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main
  });
};

const buttonMain = document.querySelector("#main");
buttonMain.addEventListener("click", sendChromeScript);
