import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes (opcional, pero mejora la apariencia)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e3c72',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#2a5298',
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 20
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#bfbfbf',
    marginBottom: 15
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#308be7'
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf'
  },
  tableCellHeader: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff'
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center'
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap'
  },
  kpiCard: {
    width: '30%',
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f8f9fa'
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2a5298'
  },
  kpiValue: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1e3c72',
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  bold: {
    fontWeight: 'bold'
  },
  // Estilos para tabla cruzada
  tableColHeaderCruzada: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#43a047'
  },
  tableColCruzada: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf'
  },
  tableCellHeaderCruzada: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff'
  },
  tableCellCruzada: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 8,
    textAlign: 'center'
  }
});

// Componente PDF para estadísticas por encuesta
const EstadisticasEncuestaPDF = ({ encuesta, kpis, estadisticas }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Reporte de Estadísticas</Text>
      <Text style={styles.subtitle}>Encuesta: {encuesta?.titulo}</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Resumen General</Text>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Grados</Text>
            <Text style={styles.kpiValue}>{kpis?.totalGrados || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Docentes</Text>
            <Text style={styles.kpiValue}>{kpis?.totalDocentes || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Preguntas</Text>
            <Text style={styles.kpiValue}>{kpis?.totalPreguntas || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Respuestas</Text>
            <Text style={styles.kpiValue}>{kpis?.totalRespuestas || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Participantes</Text>
            <Text style={styles.kpiValue}>{encuesta?.participantes || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Estadísticas por Grado</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Grado</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Nivel</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total Respuestas</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Participantes</Text>
            </View>
          </View>
          {estadisticas?.porGrado?.map((grado, index) => (
            <View key={grado.id} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{grado.nombre}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{grado.nivel}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{grado.totalRespuestas}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{grado.participantes}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

// Componente PDF para estadísticas por grado
const EstadisticasGradoPDF = ({ grado, kpis, preguntasPorGrado, alternativasPorPregunta, respuestasPorAlternativa, tablaCruzada }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Reporte de Estadísticas por Grado</Text>
      <Text style={styles.subtitle}>Grado: {grado?.nombre} - {grado?.nivel}</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Resumen del Grado</Text>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Docentes</Text>
            <Text style={styles.kpiValue}>{kpis?.totalDocentes || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Preguntas</Text>
            <Text style={styles.kpiValue}>{kpis?.totalPreguntas || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Respuestas</Text>
            <Text style={styles.kpiValue}>{kpis?.totalRespuestas || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Participantes</Text>
            <Text style={styles.kpiValue}>{grado?.participantes || 0}</Text>
          </View>
        </View>
      </View>

      {preguntasPorGrado.map((pregunta, idx) => (
        <View key={pregunta.id} style={styles.section}>
          <Text style={styles.subtitle}>Pregunta {idx + 1}: {pregunta.texto}</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Alternativa</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Cantidad de Respuestas</Text>
              </View>
            </View>
            {(alternativasPorPregunta[pregunta.id] || []).map((alt) => (
              <View key={alt.id} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{alt.texto}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Tabla Cruzada: Docente x Alternativa */}
      {tablaCruzada && tablaCruzada.docentes && tablaCruzada.alternativas && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Estadística Cruzada: Docente x Alternativa</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeaderCruzada}>
                <Text style={styles.tableCellHeaderCruzada}>Docente</Text>
              </View>
              {tablaCruzada.alternativas.map((alt) => (
                <View key={alt.id} style={styles.tableColHeaderCruzada}>
                  <Text style={styles.tableCellHeaderCruzada}>{alt.texto}</Text>
                </View>
              ))}
            </View>
            {tablaCruzada.docentes.map((docente) => (
              <View key={docente.id} style={styles.tableRow}>
                <View style={styles.tableColCruzada}>
                  <Text style={styles.tableCellCruzada}>{docente.nombre}</Text>
                </View>
                {tablaCruzada.alternativas.map((alt) => (
                  <View key={alt.id} style={styles.tableColCruzada}>
                    <Text style={styles.tableCellCruzada}>
                      {tablaCruzada.conteo[docente.id]?.[alt.id] || 0}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// Componente principal de exportación
const ExportarPDF = ({ 
  tipo, 
  encuesta, 
  kpisEncuesta, 
  estadisticas, 
  grado, 
  kpisGrado, 
  preguntasPorGrado, 
  alternativasPorPregunta, 
  respuestasPorAlternativa,
  tablaCruzada
}) => {
  const getFileName = () => {
    const fecha = new Date().toISOString().split('T')[0];
    if (tipo === 'encuesta') {
      return `estadisticas-encuesta-${fecha}.pdf`;
    } else if (tipo === 'grado') {
      return `estadisticas-grado-${grado?.nombre}-${fecha}.pdf`;
    }
    return `estadisticas-${fecha}.pdf`;
  };

  const renderPDF = () => {
    if (tipo === 'encuesta') {
      return (
        <EstadisticasEncuestaPDF 
          encuesta={encuesta}
          kpis={kpisEncuesta}
          estadisticas={estadisticas}
        />
      );
    } else if (tipo === 'grado') {
      return (
        <EstadisticasGradoPDF 
          grado={grado}
          kpis={kpisGrado}
          preguntasPorGrado={preguntasPorGrado}
          alternativasPorPregunta={alternativasPorPregunta}
          respuestasPorAlternativa={respuestasPorAlternativa}
          tablaCruzada={tablaCruzada}
        />
      );
    }
    return null;
  };

  return (
    <PDFDownloadLink 
      document={renderPDF()} 
      fileName={getFileName()}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          disabled={loading}
          sx={{
            background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)',
            },
          }}
        >
          {loading ? 'Generando PDF...' : 'Exportar a PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default ExportarPDF; 