// Inicializar os ícones do Lucide
lucide.createIcons();

// --- SISTEMA DE NAVEGAÇÃO ---
const views = {
    login: document.getElementById('view-login'),
    layout: document.getElementById('app-layout'),
};

const subViews = {
    dashboard: document.getElementById('view-dashboard'),
    clients: document.getElementById('view-clients'), // CORRIGIDO: Agora aponta para a tela certa
    createQuote: document.getElementById('view-createQuote'),
    pdfPreview: document.getElementById('view-pdfPreview')
};

function navigate(target) {
    Object.values(subViews).forEach(v => {
        if(v) v.classList.add('hidden');
    });

    if(subViews[target]) {
        subViews[target].classList.remove('hidden');
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.dataset.target === target) {
            btn.classList.add('bg-blue-50', 'text-blue-700', 'border-r-4', 'border-blue-700', 'rounded-r-none');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('bg-blue-50', 'text-blue-700', 'border-r-4', 'border-blue-700', 'rounded-r-none');
            btn.classList.add('text-slate-500');
        }
    });

    if (target === 'createQuote') {
        renderizarTabelaItens();
    }
}


// --- LÓGICA DE CLIENTES ---
let clientesList = [
    { id: 1, nome: 'Lukbox', contato: 'Rodrigo', telefone: '(17) 99242-7675' },
    { id: 2, nome: 'Condomínio Solar', contato: 'João', telefone: '(11) 98888-7777' }
];

function adicionarCliente(e) {
    e.preventDefault();
    const nome = document.getElementById('cli-nome').value;
    const contato = document.getElementById('cli-contato').value;
    const telefone = document.getElementById('cli-telefone').value;

    clientesList.push({ id: Date.now(), nome, contato, telefone });
    
    document.getElementById('form-cliente').reset();
    atualizarTelasDependentesDeClientes();
    alert("Cliente cadastrado com sucesso!");
}

function removerCliente(id) {
    if(confirm("Deseja realmente excluir este cliente?")) {
        clientesList = clientesList.filter(c => c.id !== id);
        atualizarTelasDependentesDeClientes();
    }
}

function atualizarTelasDependentesDeClientes() {
    // 1. Atualizar tabela na tela de clientes
    const tbody = document.getElementById('tabela-clientes');
    if (tbody) {
        tbody.innerHTML = clientesList.map(cli => `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 font-semibold text-slate-900">${cli.nome}</td>
                <td class="px-6 py-4 text-slate-600">${cli.contato || '-'}</td>
                <td class="px-6 py-4 text-slate-600">${cli.telefone || '-'}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="removerCliente(${cli.id})" class="text-rose-500 hover:text-rose-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // 2. Atualizar o select na tela de Orçamentos
    const select = document.getElementById('select-cliente');
    if (select) {
        select.innerHTML = '<option value="">Selecione um cliente...</option>' + 
            clientesList.map(cli => `<option value="${cli.id}">${cli.nome}</option>`).join('');
    }
    
    lucide.createIcons(); // Recarrega os ícones de lixeira gerados dinamicamente
}


// --- ESTADO DO ORÇAMENTO ---
let quoteItems = [
    { id: 1, desc: 'Desmontagem e limpeza no sistema de condensação', qty: 1, price: 450.00 },
    { id: 2, desc: 'Desidratação e carga de fluido refrigerante', qty: 1, price: 530.00 }
];

function adicionarItem() {
    quoteItems.push({ id: Date.now(), desc: '', qty: 1, price: 0 });
    renderizarTabelaItens();
}

function removerItem(id) {
    if (quoteItems.length === 1) return;
    quoteItems = quoteItems.filter(item => item.id !== id);
    renderizarTabelaItens();
}

function atualizarItem(id, campo, valor) {
    const item = quoteItems.find(i => i.id === id);
    if (item) {
        item[campo] = campo === 'desc' ? valor : Number(valor);
        calcularTotais();
    }
}

function renderizarTabelaItens() {
    const tbody = document.getElementById('tabela-itens');
    if(!tbody) return;
    tbody.innerHTML = '';

    quoteItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'group';
        tr.innerHTML = `
            <td class="py-3 pr-2">
                <input type="text" value="${item.desc}" onkeyup="atualizarItem(${item.id}, 'desc', this.value)" class="w-full bg-transparent border-none p-0 outline-none text-sm" placeholder="Descrição">
            </td>
            <td class="py-3 px-2">
                <input type="number" value="${item.qty}" onchange="atualizarItem(${item.id}, 'qty', this.value)" onkeyup="atualizarItem(${item.id}, 'qty', this.value)" class="w-full bg-transparent border-none p-0 outline-none text-sm text-center">
            </td>
            <td class="py-3 px-2 flex items-center">
                <span class="text-slate-400 mr-1 text-sm">R$</span>
                <input type="number" value="${item.price}" onchange="atualizarItem(${item.id}, 'price', this.value)" onkeyup="atualizarItem(${item.id}, 'price', this.value)" class="w-full bg-transparent border-none p-0 outline-none text-sm">
            </td>
            <td class="py-3 px-2 font-medium text-sm text-slate-700" id="total-linha-${item.id}">
                R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}
            </td>
            <td class="py-3 text-right">
                <button onclick="removerItem(${item.id})" class="text-slate-300 hover:text-rose-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
    calcularTotais();
}

function calcularTotais() {
    const totalMateriais = quoteItems.reduce((acc, item) => {
        const el = document.getElementById(`total-linha-${item.id}`);
        if(el) el.innerText = `R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}`;
        return acc + (item.qty * item.price);
    }, 0);

    const maoDeObra = Number(document.getElementById('mao-de-obra').value) || 0;
    const totalGeral = totalMateriais + maoDeObra;

    document.getElementById('total-materiais').innerText = `R$ ${totalMateriais.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-geral').innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}


// --- GERAÇÃO REAL DO PDF COM jsPDF ---
function baixarPDFReal() {
    // Validação de Cliente
    const select = document.getElementById('select-cliente');
    if(!select.value) {
        alert("Por favor, selecione um cliente antes de gerar o PDF.");
        return;
    }

    const clienteSelecionado = clientesList.find(c => c.id == select.value);
    const equipamentoDesc = document.getElementById('equipamento').value || 'Não informado';
    const maoDeObra = Number(document.getElementById('mao-de-obra').value) || 0;
    const totalGeral = quoteItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0) + maoDeObra;

    // Inicializa o jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- CABEÇALHO (Baseado no seu modelo MAC FRIO) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ServPro", 14, 20);
    doc.setFontSize(12);
    doc.text("SISTEMAS DE REFRIGERAÇÃO", 14, 26);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Razão social: SERVICOS TECNICOS LTDA", 14, 34);
    doc.text("CNPJ: 00.000.000/0001-00", 14, 39);
    doc.text("Contato: Administração", 14, 44);

    // Lateral Direita (Orçamento e Data)
    doc.setFont("helvetica", "bold");
    doc.text("Orçamento:", 150, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 150, 26);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);

    // --- DADOS DO CLIENTE ---
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, 60);
    doc.setFont("helvetica", "normal");
    doc.text(clienteSelecionado.nome, 30, 60);

    doc.text(`Att: ${clienteSelecionado.contato || '-'}`, 14, 66);
    doc.text(`Telefone: ${clienteSelecionado.telefone || '-'}`, 14, 72);
    
    doc.setFont("helvetica", "bold");
    doc.text("Descrição:", 14, 82);
    doc.setFont("helvetica", "normal");
    doc.text(`Reparo / Manutenção: ${equipamentoDesc}`, 35, 82);

    // --- TABELA DE ITENS (Usando autoTable) ---
    const tableData = quoteItems.map((item, index) => [
        index + 1,
        item.desc,
        item.qty,
        `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}`,
        `R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}`
    ]);

    // Linhas de Totais inseridas no fim da tabela
    if (maoDeObra > 0) {
        tableData.push([{ content: 'Mão de Obra', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `R$ ${maoDeObra.toFixed(2).replace('.', ',')}`]);
    }
    tableData.push([{ content: 'VALOR TOTAL:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } }, `R$ ${totalGeral.toFixed(2).replace('.', ',')}`]);

    doc.autoTable({
        startY: 90,
        head: [['Item', 'Descrição do produto', 'Qtde', 'Vl Unit', 'Vl Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // Cor Azul do Tailwind bg-blue-600
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' },
        }
    });

    // --- RODAPÉ E CONDIÇÕES ---
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFont("helvetica", "bold");
    doc.text("Condições de Fornecimento:", 14, finalY);
    
    doc.setFont("helvetica", "normal");
    doc.text("Cond. Pagamento: À vista", 14, finalY + 8);
    doc.text("Validade da Proposta: 2 dias", 14, finalY + 14);

    // Baixar o arquivo PDF
    const nomeArquivo = `Orcamento_${clienteSelecionado.nome.replace(/\s+/g, '_')}.pdf`;
    doc.save(nomeArquivo);
}


// INICIALIZAÇÃO DO APP
atualizarTelasDependentesDeClientes();
navigate('dashboard'); // Inicia direto no Dashboard (pulando login)