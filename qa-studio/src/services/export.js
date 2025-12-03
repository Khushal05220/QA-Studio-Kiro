import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export function exportToJson(data, filename) {
  // Format with proper structure and metadata
  const exportData = {
    exportedAt: new Date().toISOString(),
    itemCount: data.length,
    data: data
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportToCsv(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return;
  
  // Format test cases specifically
  const isTestCase = data[0].steps || data[0].expectedResult;
  
  if (isTestCase) {
    const headers = ['Scenario', 'Epic', 'Title', 'Category', 'Priority', 'Preconditions', 'Steps', 'Expected Result', 'Tags', 'Estimated Time (min)'];
    const rows = data.map(tc => {
      const steps = tc.steps?.map((s, i) => `${i + 1}. ${s.action}`).join(' | ') || '';
      const preconditions = tc.preconditions?.join(' | ') || '';
      const tags = tc.tags?.join(', ') || '';
      
      return [
        tc.scenarioTitle || tc.epic || '',
        tc.epic || '',
        tc.title || '',
        tc.category || '',
        tc.priority || '',
        preconditions,
        steps,
        tc.expectedResult || '',
        tags,
        tc.estimatedTimeMinutes || ''
      ].map(val => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
  } else {
    // Generic CSV export for other data types
    const headers = Object.keys(flattenObject(data[0]));
    const rows = data.map(item => {
      const flat = flattenObject(item);
      return headers.map(h => {
        const val = flat[h];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
  }
}

export function exportToExcel(data, filename, sheetName = 'Sheet1') {
  const isTestCase = data[0]?.steps || data[0]?.expectedResult;
  
  let formattedData;
  if (isTestCase) {
    // Format test cases with proper structure
    formattedData = data.map(tc => ({
      'Scenario': tc.scenarioTitle || tc.epic || '',
      'Epic': tc.epic || '',
      'Title': tc.title || '',
      'Category': tc.category || '',
      'Priority': tc.priority || '',
      'Preconditions': tc.preconditions?.join('\n') || '',
      'Steps': tc.steps?.map((s, i) => `${i + 1}. ${s.action}`).join('\n') || '',
      'Expected Result': tc.expectedResult || '',
      'Tags': tc.tags?.join(', ') || '',
      'Estimated Time (min)': tc.estimatedTimeMinutes || '',
      'Generated At': tc.generatedAt ? new Date(tc.generatedAt).toLocaleString() : ''
    }));
  } else {
    formattedData = data.map(flattenObject);
  }
  
  const ws = XLSX.utils.json_to_sheet(formattedData);
  
  // Auto-size columns
  const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  ws['!cols'] = colWidths;
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf(content, filename, options = {}) {
  const { title, sections = [] } = options;
  const doc = new jsPDF();
  let y = 20;
  
  doc.setFontSize(18);
  doc.setTextColor(45, 212, 191);
  if (title) {
    doc.text(title, 20, y);
    y += 15;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  
  if (typeof content === 'string') {
    const lines = doc.splitTextToSize(content, 170);
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 7;
    });
  }
  
  sections.forEach(section => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(45, 212, 191);
    doc.text(section.title, 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    
    const lines = doc.splitTextToSize(section.content, 170);
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
    y += 5;
  });
  
  doc.save(`${filename}.pdf`);
}

export function exportToMarkdown(data, filename) {
  let md = '';
  
  if (typeof data === 'string') {
    md = data;
  } else if (Array.isArray(data)) {
    data.forEach((item, i) => {
      md += `## Item ${i + 1}\n\n`;
      Object.entries(item).forEach(([key, value]) => {
        md += `**${key}:** ${JSON.stringify(value)}\n\n`;
      });
    });
  } else {
    Object.entries(data).forEach(([key, value]) => {
      md += `## ${key}\n\n${JSON.stringify(value, null, 2)}\n\n`;
    });
  }
  
  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, `${filename}.md`);
}

export function exportToPostman(collection, filename) {
  const postmanCollection = {
    info: {
      name: collection.name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: collection.requests.map(req => ({
      name: req.name,
      request: {
        method: req.method,
        header: Object.entries(req.headers || {}).map(([key, value]) => ({ key, value })),
        url: {
          raw: req.url,
          host: [req.url.split('/')[2]],
          path: req.url.split('/').slice(3)
        },
        body: req.body ? {
          mode: 'raw',
          raw: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
          options: { raw: { language: 'json' } }
        } : undefined
      }
    }))
  };
  
  exportToJson(postmanCollection, filename);
}

function flattenObject(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (Array.isArray(value)) {
      result[newKey] = value.map(v => 
        typeof v === 'object' ? JSON.stringify(v) : v
      ).join('; ');
    } else if (value && typeof value === 'object') {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
