import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

/**
 * Componente para exportar estadísticas a Excel con formato profesional.
 * Incluye colores, estilos y todas las estadísticas detalladas por grado.
 */
const ExportarExcel = ({
  tipo, // 'encuesta' o 'grado'
  encuesta, // objeto de encuesta seleccionada
  kpisEncuesta, // KPIs de la encuesta
  estadisticas, // objeto de estadísticas generales
  grado, // objeto de grado seleccionado
  kpisGrado, // KPIs del grado
  preguntasPorGrado, // array de preguntas del grado
  alternativasPorPregunta, // alternativas por pregunta
  respuestasPorAlternativa, // respuestas por alternativa
  tablaCruzada // datos de la tabla cruzada (opcional)
}) => {
  
  // Función para aplicar estilos a una hoja
  const aplicarEstilos = (ws, range) => {
    // Estilos para encabezados
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "308BE7" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Estilos para datos
    const dataStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } }
      }
    };

    // Estilos para totales
    const totalStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "43A047" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Aplicar estilos
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        if (R === 0) {
          // Encabezados
          ws[cellAddress].s = headerStyle;
        } else if (R === range.e.r) {
          // Fila de totales
          ws[cellAddress].s = totalStyle;
        } else {
          // Datos normales
          ws[cellAddress].s = dataStyle;
        }
      }
    }
  };

  // Función para crear tabla cruzada por pregunta
  const crearTablaCruzadaPorPregunta = (pregunta) => {
    if (!tablaCruzada || !tablaCruzada.docentes || !tablaCruzada.alternativas) return null;
    
    const alternativasPregunta = alternativasPorPregunta[pregunta.id] || [];
    const header = ['Docente', ...alternativasPregunta.map(a => a.texto), 'Total'];
    
    const rows = tablaCruzada.docentes.map(docente => {
      const valores = alternativasPregunta.map(alt => tablaCruzada.conteo[docente.id]?.[alt.id] || 0);
      const total = valores.reduce((sum, val) => sum + val, 0);
      return [docente.nombre, ...valores, total];
    });
    
    // Fila de totales
    const totales = ['TOTAL'];
    alternativasPregunta.forEach(alt => {
      const totalAlt = tablaCruzada.docentes.reduce((sum, docente) => 
        sum + (tablaCruzada.conteo[docente.id]?.[alt.id] || 0), 0);
      totales.push(totalAlt);
    });
    const totalGeneral = totales.slice(1).reduce((sum, val) => sum + val, 0);
    totales.push(totalGeneral);
    
    return [header, ...rows, totales];
  };

  // Función para crear estadísticas generales por alternativas
  const crearEstadisticasGeneralesAlternativas = () => {
    if (!preguntasPorGrado || !alternativasPorPregunta || !respuestasPorAlternativa) return null;
    
    const header = ['Pregunta', 'Alternativa', 'Cantidad', 'Porcentaje'];
    const rows = [];
    
    preguntasPorGrado.forEach(pregunta => {
      const alternativas = alternativasPorPregunta[pregunta.id] || [];
      const totalPregunta = alternativas.reduce((sum, alt) => 
        sum + (respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0), 0);
      
      alternativas.forEach(alt => {
        const cantidad = respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0;
        const porcentaje = totalPregunta > 0 ? ((cantidad / totalPregunta) * 100).toFixed(1) : 0;
        rows.push([pregunta.texto, alt.texto, cantidad, `${porcentaje}%`]);
      });
    });
    
    return [header, ...rows];
  };

  // Función para crear ranking individual por alternativa
  const crearRankingIndividual = () => {
    if (!tablaCruzada || !tablaCruzada.docentes || !tablaCruzada.alternativas) return null;
    
    const header = ['Posición', 'Docente', 'Alternativa', 'Cantidad', 'Porcentaje del Total'];
    const rankings = [];
    
    tablaCruzada.docentes.forEach(docente => {
      tablaCruzada.alternativas.forEach(alt => {
        const cantidad = tablaCruzada.conteo[docente.id]?.[alt.id] || 0;
        if (cantidad > 0) {
          const totalAlternativa = tablaCruzada.docentes.reduce((sum, d) => 
            sum + (tablaCruzada.conteo[d.id]?.[alt.id] || 0), 0);
          const porcentaje = totalAlternativa > 0 ? ((cantidad / totalAlternativa) * 100).toFixed(1) : 0;
          rankings.push({
            docente: docente.nombre,
            alternativa: alt.texto,
            cantidad,
            porcentaje: parseFloat(porcentaje)
          });
        }
      });
    });
    
    // Ordenar por cantidad descendente
    rankings.sort((a, b) => b.cantidad - a.cantidad);
    
    const rows = rankings.map((item, index) => [
      index + 1,
      item.docente,
      item.alternativa,
      item.cantidad,
      `${item.porcentaje}%`
    ]);
    
    return [header, ...rows];
  };

  const exportar = () => {
    const wb = XLSX.utils.book_new();
    const fecha = new Date().toISOString().split('T')[0];

    if (tipo === 'encuesta') {
      // Hoja 1: KPIs generales
      const kpisSheet = [
        ['INDICADORES GENERALES DE LA ENCUESTA'],
        [''],
        ['Total Grados', kpisEncuesta?.totalGrados || 0],
        ['Total Docentes', kpisEncuesta?.totalDocentes || 0],
        ['Total Preguntas', kpisEncuesta?.totalPreguntas || 0],
        ['Total Respuestas', kpisEncuesta?.totalRespuestas || 0],
        ['Participantes', encuesta?.participantes || 0],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(kpisSheet);
      ws1['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'KPIs Encuesta');

      // Hoja 2: Estadísticas por Grado
      if (estadisticas?.porGrado?.length) {
        const gradoSheet = [
          ['Grado', 'Nivel', 'Total Respuestas', 'Participantes', 'Promedio por Participante'],
          ...estadisticas.porGrado.map(g => [
            g.nombre, 
            g.nivel, 
            g.totalRespuestas, 
            g.participantes,
            g.participantes > 0 ? (g.totalRespuestas / g.participantes).toFixed(2) : 0
          ])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(gradoSheet);
        ws2['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Por Grado');
      }
    }

    if (tipo === 'grado') {
      // Hoja 1: KPIs del grado
      const kpisSheet = [
        [`INDICADORES DEL GRADO: ${grado?.nombre?.toUpperCase()}`],
        [''],
        ['Total Docentes', kpisGrado?.totalDocentes || 0],
        ['Total Preguntas', kpisGrado?.totalPreguntas || 0],
        ['Total Respuestas', kpisGrado?.totalRespuestas || 0],
        ['Participantes', grado?.participantes || 0],
        ['Promedio Respuestas por Docente', kpisGrado?.totalDocentes > 0 ? (kpisGrado?.totalRespuestas / kpisGrado?.totalDocentes).toFixed(2) : 0],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(kpisSheet);
      ws1['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'KPIs Grado');

      // Hoja 2: Estadísticas por Pregunta
      if (preguntasPorGrado?.length) {
        preguntasPorGrado.forEach((pregunta, idx) => {
          const alternativas = alternativasPorPregunta[pregunta.id] || [];
          const totalPregunta = alternativas.reduce((sum, alt) => 
            sum + (respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0), 0);
          
          const altSheet = [
            [`ESTADÍSTICAS DE LA PREGUNTA ${idx + 1}: ${pregunta.texto}`],
            [''],
            ['Alternativa', 'Cantidad de Respuestas', 'Porcentaje'],
            ...alternativas.map(alt => {
              const cantidad = respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0;
              const porcentaje = totalPregunta > 0 ? ((cantidad / totalPregunta) * 100).toFixed(1) : 0;
              return [alt.texto, cantidad, `${porcentaje}%`];
            }),
            ['TOTAL', totalPregunta, '100%']
          ];
          
          const ws = XLSX.utils.aoa_to_sheet(altSheet);
          ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, ws, `Pregunta ${idx + 1}`);
        });
      }

      // Hoja 3: Tabla cruzada general Docente x Alternativa
      if (tablaCruzada && tablaCruzada.docentes && tablaCruzada.alternativas) {
        const header = ['Docente', ...tablaCruzada.alternativas.map(a => a.texto), 'Total'];
        const rows = tablaCruzada.docentes.map(docente => {
          const valores = tablaCruzada.alternativas.map(alt => tablaCruzada.conteo[docente.id]?.[alt.id] || 0);
          const total = valores.reduce((sum, val) => sum + val, 0);
          return [docente.nombre, ...valores, total];
        });
        
        // Fila de totales
        const totales = ['TOTAL'];
        tablaCruzada.alternativas.forEach(alt => {
          const totalAlt = tablaCruzada.docentes.reduce((sum, docente) => 
            sum + (tablaCruzada.conteo[docente.id]?.[alt.id] || 0), 0);
          totales.push(totalAlt);
        });
        const totalGeneral = totales.slice(1).reduce((sum, val) => sum + val, 0);
        totales.push(totalGeneral);
        
        const cruzadaSheet = [
          ['TABLA CRUZADA: DOCENTES VS ALTERNATIVAS'],
          [''],
          header,
          ...rows,
          totales
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(cruzadaSheet);
        ws['!cols'] = [{ wch: 25 }, ...tablaCruzada.alternativas.map(() => ({ wch: 15 })), { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Cruzada General');
      }

      // Hoja 4: Estadísticas por Pregunta con Tabla Cruzada
      if (preguntasPorGrado?.length) {
        preguntasPorGrado.forEach((pregunta, idx) => {
          const alternativas = alternativasPorPregunta[pregunta.id] || [];
          const totalPregunta = alternativas.reduce((sum, alt) => 
            sum + (respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0), 0);
          
          // Estadísticas generales de la pregunta
          const estadisticasPregunta = [
            [`ESTADÍSTICAS DETALLADAS DE LA PREGUNTA ${idx + 1}: ${pregunta.texto}`],
            [''],
            ['Alternativa', 'Cantidad de Respuestas', 'Porcentaje'],
            ...alternativas.map(alt => {
              const cantidad = respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0;
              const porcentaje = totalPregunta > 0 ? ((cantidad / totalPregunta) * 100).toFixed(1) : 0;
              return [alt.texto, cantidad, `${porcentaje}%`];
            }),
            ['TOTAL', totalPregunta, '100%'],
            [''],
            ['TABLA CRUZADA: DOCENTE X ALTERNATIVA (Pregunta actual)'],
            ['']
          ];
          
          // Tabla cruzada para esta pregunta específica
          const tablaCruzadaPregunta = crearTablaCruzadaPorPregunta(pregunta);
          if (tablaCruzadaPregunta) {
            estadisticasPregunta.push(...tablaCruzadaPregunta);
          }
          
          const ws = XLSX.utils.aoa_to_sheet(estadisticasPregunta);
          ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, ws, `Pregunta ${idx + 1} Detallada`);
        });
      }

      // Hoja 5: Estadísticas Generales por Alternativas
      const estadisticasGenerales = crearEstadisticasGeneralesAlternativas();
      if (estadisticasGenerales) {
        const generalSheet = [
          ['ESTADÍSTICAS GENERALES POR ALTERNATIVAS (Todos los docentes del grado)'],
          [''],
          ...estadisticasGenerales
        ];
        const ws = XLSX.utils.aoa_to_sheet(generalSheet);
        ws['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas Generales');
      }

      // Hoja 6: Ranking Individual por Alternativa
      const rankingIndividual = crearRankingIndividual();
      if (rankingIndividual) {
        const rankingSheet = [
          ['RANKING INDIVIDUAL POR ALTERNATIVA'],
          [''],
          ...rankingIndividual
        ];
        const ws = XLSX.utils.aoa_to_sheet(rankingSheet);
        ws['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Ranking Individual');
      }
    }

    // Nombre del archivo
    let fileName = 'estadisticas-';
    if (tipo === 'encuesta') fileName += 'encuesta-';
    if (tipo === 'grado') fileName += `grado-${grado?.nombre}-`;
    fileName += fecha + '.xlsx';

    // Descargar
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<DownloadIcon />}
      onClick={exportar}
      sx={{
        background: 'linear-gradient(90deg, #43a047 0%, #308be7 100%)',
        color: '#fff',
        fontWeight: 600,
        '&:hover': {
          background: 'linear-gradient(90deg, #308be7 0%, #43a047 100%)',
        },
      }}
    >
      Exportar a Excel
    </Button>
  );
};

export default ExportarExcel; 