import "../styles/grid.css";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { openVersionView } from "../utils/openVersionView.js";
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const upper = (value) => (value == null ? value : String(value).toUpperCase());

// Alturas usadas no cálculo da linha expandida — precisam bater com grid.css
// (.expandable-cell.expanded, .expand-row-btn e .expandable-cell-list li).
const ROW_HEIGHT = 35;
const EXPANDED_BASE_HEIGHT = 46;
const EXPANDED_ITEM_HEIGHT = 28;

// Quantidade de linhas que a linha expandida precisa mostrar: a maior lista
// entre aplicações e chaves (listas de 1 item não expandem).
function expandedItemCount(data) {
  const apps = data?.aplicacoes?.length || 0;
  const chaves = data?.chaves?.length || 0;
  return Math.max(apps > 1 ? apps : 0, chaves > 1 ? chaves : 0);
}

// Guarda os IDs das linhas expandidas. As células assinam o store com
// useSyncExternalStore, então re-renderizam na hora do clique sem depender
// do refreshCells da AG Grid (que não re-renderiza células React com as mesmas props).
function createExpandedStore() {
  const ids = new Set();
  const listeners = new Set();
  return {
    has: (id) => ids.has(id),
    toggle(id) {
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// A AG Grid trata o clique na linha (seleção, onRowClicked) com listeners
// nativos que rodam antes do onClick do React, então e.stopPropagation() não
// adianta. Marcando o evento nativo no próprio botão, a grid o ignora.
function ignoreInGrid(el) {
  if (!el) return;
  const marcar = (e) => { e.__ag_Grid_Stop_Propagation = true; };
  el.addEventListener("pointerdown", marcar);
  el.addEventListener("click", marcar);
  return () => {
    el.removeEventListener("pointerdown", marcar);
    el.removeEventListener("click", marcar);
  };
}

// Célula com lista: 1 item mostra direto; vários mostram o botão "Ver" e uma
// seta que expande a linha dentro da própria tabela, listando todos os itens.
// A expansão vale para a linha inteira (todas as colunas de lista juntas).
function ListCell({ data, context, items, formatItem }) {
  const { expandedStore, toggleExpanded } = context;
  const expanded = useSyncExternalStore(
    expandedStore.subscribe,
    () => expandedStore.has(data?.id),
  );

  if (!items || items.length === 0) return <span>—</span>;

  if (items.length === 1) return <span>{formatItem(items[0]) || "—"}</span>;

  return (
    <div className={`expandable-cell${expanded ? " expanded" : ""}`}>
      <div className="expandable-cell-actions">
        <button
          ref={ignoreInGrid}
          type="button"
          className="expand-row-btn"
          title={expanded ? "Recolher" : "Expandir"}
          aria-expanded={expanded}
          onClick={() => toggleExpanded(data.id)}
        >
          {expanded ? "▾" : "▸"}
        </button>
        <button className="ver-apps-btn" onClick={() => openVersionView(data)}>
          Ver ({items.length})
        </button>
      </div>
      {expanded && (
        <ul className="expandable-cell-list">
          {items.map((item, i) => {
            const texto = formatItem(item) || "—";
            return <li key={i} title={texto}>{texto}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

function AppNomeCell(props) {
  return <ListCell {...props} items={props.data?.aplicacoes} formatItem={(a) => a.nome} />;
}

function AppVersaoCell(props) {
  return <ListCell {...props} items={props.data?.aplicacoes} formatItem={(a) => a.versao} />;
}

function ChaveCell(props) {
  return <ListCell {...props} items={props.data?.chaves} formatItem={(c) => upper(c.chave)} />;
}

const columns = [
  { field: "pacote",     rowGroup: true, headerName: "Pacote", filter: true, minWidth: 200, valueFormatter: (p) => upper(p.value) },
  { field: "equipamento", filter: true, minWidth: 200, valueFormatter: (p) => upper(p.value) },
  { field: "plataforma", headerName: "Plataforma", filter: true, minWidth: 180 },
  { field: "modelo",     rowGroup: true, headerName: "Modelo", filter: true, minWidth: 180, valueFormatter: (p) => upper(p.value) },
  { field: "fw",         headerName: "FW",           filter: true, minWidth: 140 },
  { field: "sphs",       headerName: "SPHS",         filter: true, minWidth: 140 },
  { field: "firmware_version", headerName: "Firmware version", filter: true, minWidth: 160 },

  { field: "versao_so",  headerName: "Versão SO",    filter: true, minWidth: 400 },
  { field: "security_version", headerName: "Security Version(SV)", filter: true, minWidth: 220 },
  { field: "firmware",                                filter: true,minWidth: 400 },
  { field: "puk_crc",    headerName: "PUK/CRC",      filter: true, minWidth: 300, valueFormatter: (p) => upper(p.value) },
  {
    field: "aplicacoes",
    headerName: "Aplicação",
    cellRenderer: AppNomeCell,
    valueGetter: (p) => (p.data?.aplicacoes || []).map((a) => a.nome).filter(Boolean).join(", "),
    minWidth: 300,
  },
  {
    field: "aplicacoes_versao",
    headerName: "Versão APP",
    cellRenderer: AppVersaoCell,
    valueGetter: (p) => (p.data?.aplicacoes || []).map((a) => a.versao).filter(Boolean).join(", "),
    minWidth: 200,
  },
  { field: "versao_bt",  headerName: "Versão BT",    filter: true, minWidth: 300 },
  { field: "versao_wifi", headerName: "Wi-Fi",       filter: true, minWidth: 300, valueFormatter: (p) => upper(p.value) },
  { field: "versao_gprs", headerName: "GPRS",        filter: true , minWidth: 300, valueFormatter: (p) => upper(p.value) },
  {
    field: "possui_logo",
    headerName: "Possui logo",
    filter: true,
    valueFormatter: (p) => {
      const v = String(p.value ?? "").toUpperCase();
      return (v === "SIM" || v === "1" || v === "TRUE") ? "SIM" : "NÃO";
    },
  },
  {
    field: "chaves",
    headerName: "Chaves",
    cellRenderer: ChaveCell,
    valueGetter: (p) => upper((p.data?.chaves || []).map((c) => c.chave).filter(Boolean).join(", ")),
    minWidth: 250,
  },
  { field: "qtd_chaves",   headerName: "Qtd Chaves",  filter: true },
  { field: "configurador", headerName: "Configurador", filter: true },
  { field: "fonte",        headerName: "Fonte",        filter: true },
  { field: "tipo_chaves",  headerName: "Tipo chave",  filter: true, valueFormatter: (p) => upper(p.value) },
  {
    field: "createdAt",
    headerName: "Data",
    filter: "agDateColumnFilter",
    valueFormatter: (p) => {
      if (!p.value) return "—";
      const d = new Date(p.value);
      return d.toLocaleDateString("pt-BR");
    },
  },
];

const autoGroupColumnDef = {
  headerName: "Pacote / Modelo",
  minWidth: 260,
  cellRendererParams: { suppressCount: false },
};

const localeText = {
  contains: "Contém",
  notContains: "Não contém",
  equals: "Igual",
  notEqual: "Diferente",
  startsWith: "Começa com",
  endsWith: "Termina com",
  blank: "Vazio",
  notBlank: "Preenchido",
  filterOoo: "Filtrar...",
  searchOoo: "Pesquisar...",
  noRowsToShow: "Nenhum registro encontrado",
  page: "Página",
  more: "Mais",
  to: "até",
  of: "de",
  next: "Próxima",
  last: "Última",
  first: "Primeira",
  previous: "Anterior",
  group: "Grupo",
  rowGroupColumnsEmptyMessage: "Arraste colunas aqui para agrupar",
};

function VersionGrid({ data, selectedRow, setSelectedRow, gridRef, theme = "transire" }) {
  const themeClass = theme === "amazonas"
    ? "ag-theme-quartz ag-theme-quartz-amazonas"
    : "ag-theme-quartz";

  const [expandedStore] = useState(createExpandedStore);
  const apiRef = useRef(null);

  const toggleExpanded = useCallback((id) => {
    expandedStore.toggle(id);
    // Recalcula as alturas pelo getRowHeight (cresce ao expandir, volta ao recolher).
    apiRef.current?.resetRowHeights();
  }, [expandedStore]);

  const context = useMemo(() => ({ expandedStore, toggleExpanded }), [expandedStore, toggleExpanded]);

  const getRowHeight = useCallback((params) => {
    if (!params.data || !expandedStore.has(params.data.id)) return ROW_HEIGHT;
    return EXPANDED_BASE_HEIGHT + expandedItemCount(params.data) * EXPANDED_ITEM_HEIGHT;
  }, [expandedStore]);

  return (
    <div className={themeClass} style={{ height: 600, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={data}
        localeText={localeText}
        context={context}
        getRowHeight={getRowHeight}
        onGridReady={(event) => { apiRef.current = event.api; }}
        columnDefs={columns}
        autoGroupColumnDef={autoGroupColumnDef}
        groupDisplayType="singleColumn"
        groupDefaultExpanded={0}
        rowSelection="single"
        pagination={true}
        animateRows={true}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          flex: 1,
          minWidth: 160,
        }}
        onRowClicked={(event) => {
          if (event.node.group) return;
          const alreadySelected = selectedRow?.id === event.data.id;
          if (alreadySelected) {
            event.node.setSelected(false);
            setSelectedRow(null);
          } else {
            event.node.setSelected(true);
            setSelectedRow(event.data);
          }
        }}
      />
    </div>
  );
}

export default VersionGrid;
