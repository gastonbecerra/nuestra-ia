import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heading } from '../components/UI';
export default function Project() {
  const {hash}=useLocation();
  useEffect(()=>{if(hash)document.getElementById(hash.slice(1))?.scrollIntoView();},[hash]);
  return <><Heading title="Un proyecto para mirar la IA desde la región"/><div className="about-grid"><nav className="panel about-nav" aria-label="En esta página">
    <Link to="/proyecto#fundamentacion">Fundamentación</Link>
    <Link to="/proyecto#origen">Origen</Link>
    <Link to="/proyecto#metodologia">Metodología</Link>
    <Link to="/proyecto#contacto">Contacto</Link>
    <Link to="/proyecto#referencias">Referencias</Link>
    </nav>

    <div className="prose about-content">

    <section id="fundamentacion"><h2>Fundamentación</h2>
    <p>Una parte importante de lo que discutimos acerca de la inteligencia artificial se organiza alrededor de casos de interés público, de controversias, y hasta de mitos (Becerra, Mezzadra, & Movía, 2024). En este sentido, los límites de lo que sabemos sobre la IA son también los límites de nuestra reflexión.</p>
    <p>Muchas de estas discusiones responden a noticias de los países en los que la IA se produce y diseña. Sin embargo, una reflexión construida principalmente a partir de los flujos informativos de paises <em>centrales</em> corre el riesgo de universalizar aquello que estos espacios logran observar, y dejar en penumbras lo que sucede en las regiones <em>periféricas</em>. Esta mirada puede resultar riesgosa para la reflexión porque los efectos de la IA varían según el contexto en el que se despliega, respondiendo a particularidades sociohistóricas de cada región, como a la posición que ésta ocupa dentro de la economía digital global (Rikap, 2025; Ricaurte et al., 2024).</p>
    </section>

    <section id="origen"><h2>Origen</h2>
    <p>Este proyecto nació en las aulas de dos cursos. El primero fue sobre <em>Sociología de la IA</em> y era una experiencia de aprendizaje colaborativo internacional en línea (COIL) entre estudiantes del Programa de Sociología de Areandina de Colombia, de la carrera de Ciencias Políticas de la Universidad Antonio Ruiz de Montoya (UARM) de Perú, y de varias carreras de la Universidad de Flores (UFLO) de Argentina. El segundo era sobre <em>Filosofía de la IA</em> y era parte de la Diplomatura en Inteligencia Artificial de la Universidad de Flores (UFLO), en el que participaban graduados de diversas disciplinas y distintos lugares de residencia, aunque mayormente argentino. En ambos cursos, los estudiantes seleccionaron casos de adopción, desarrollo o uso de la IA en América Latina, que fueran relevantes para su campo disciplinar. Los casos relevados se convirtieron luego en el punto de partida para una segunda instancia de análisis o reflexión grupal.</p>
    <p>A partir de estos primeros casos se desarrolló un dashboard interactivo para organizar, visualizar y explorar la casuística construida durante el COIL. Este desarrollo buscó transformar el conjunto de las experiencias relevadas en un corpus estructurado y consultable, al permitir visualizar y filtrar los casos según distintas dimensiones, y registrar para cada uno los principales actores involucrados, riesgos identificados y áreas de incidencia de la IA. La herramienta fue posteriormente adoptada por el equipo de investigación "IA en la cultura", dirigido por el Dr. Joaquín Mezzadra, radicado en la Licenciatura en Sociología de UFLO, para continuar su actualización y desarrollo.</p>
    </section>

    <section id="metodologia">
      <h2>Metodología</h2>

      <h3>Unidad de análisis y criterio de inclusión</h3>
      <p>Los casos refieren a experiencias e iniciativas de desarrollo o adopción de la IA, o a problemáticas y situaciones que se registraron en la región a partir de la incorporación de IA. La unidad es el caso documentado. Los casos pueden tener varias fuentes, como noticias o sitios web.</p>
      <p>Además de los casos seleccionados por los estudiantes, se incluyeron otros casos documentados en el Atlas de la IA de Béliz (2025), así como otros casos relevantes que se identificaron en un corpus elaborado por el equipo de investigación.</p>
      <p>La distribución refleja las procedencias e intereses de quienes participamos del relevamiento. No es representativa de toda la adopción de IA en América Latina. Las diferencias entre países no son tasas de implementación, riesgo o daño.</p>

      <h3>Categorías y evidencia</h3>
      <p>Ámbitos, tecnologías, herramientas, actores, promesas y riesgos son etiquetas no excluyentes. Una etiqueta de riesgo no acredita un daño efectivamente ocurrido, del mismo modo que una etiqueta de promesa no constituye un logro acreditado.</p>

      <h3>Clasificación asistida</h3>
      <p>Las reseñas de los casos, y varias categorías asignadas fueron normalizadas con el uso de LLMs y supervisadas por el equipo.</p>
    </section>

    <section id="contacto"><h2>Contacto</h2>
    <p>Para más información sobre el proyecto, puede contactar a los investigadores joaquin.mezzadra@uflouniversidad.edu.ar y/o gaston.becerra@uflouniversidad.edu.ar.</p>
    </section>


    <section id="referencias" aria-labelledby="referencias-titulo">
      <h2 id="referencias-titulo">Referencias</h2>
      <ul className="references-list">
        <li>Becerra, G., Mezzadra, J. I., &amp; Movia, G. (Eds.). (2025). <em>Mitos y representaciones de la inteligencia artificial.</em> Editorial de la Universidad de Flores. <a href="https://doi.org/10.63790/978-987-710-129-4" target="_blank" rel="noopener noreferrer">https://doi.org/10.63790/978-987-710-129-4</a></li>
        <li>Beliz, G. (2025). <em>Atlas de inteligencia artificial para el desarrollo humano de América Latina y el Caribe.</em> Programa de las Naciones Unidas para el Desarrollo. <a href="https://www.undp.org/es/latin-america/publicaciones/atlas-de-inteligencia-artificial-para-america-latina-y-el-caribe" target="_blank" rel="noopener noreferrer">Ver publicación</a></li>
        <li>Ricaurte, P., Gómez-Cruz, E., &amp; Siles, I. (2024). Algorithmic governmentality in Latin America: Sociotechnical imaginaries, neocolonial soft power, and authoritarianism. <em>Big Data and Society, 11</em>(1). <a href="https://doi.org/10.1177/20539517241229697" target="_blank" rel="noopener noreferrer">https://doi.org/10.1177/20539517241229697</a></li>
        <li>Rikap, C. (2026). <em>Teoría de la dependencia digital: Soberanía y desarrollo en el capitalismo del siglo XXI.</em> Caja Negra Editora.</li>
      </ul>
    </section>


  </div></div></>;
}
