import { Facil } from '../dist/facil.min.js';

//0. Dark mode
Facil.darkMode.init();

Facil.dom('#btn-tema').on('click', () => {
	const novoTema = Facil.darkMode.toggle();
	alert(`Tema mudou para: ${novoTema}`);
});

// 1. DOM e EVENTOS
Facil.dom('#btn-dom').on('click', () => {
	Facil.dom('#text-dom')
		.html('O DOM foi manipulado com sucesso!')
		.addClass('text-success')
		.addClass('fw-bold');
	
	Facil.events.emit('meuEventoGlobal', 'O botão de DOM foi clicado!');
});

Facil.events.on('meuEventoGlobal', (dados) => {
	Facil.dom('#text-evento')
		.html(`📡 Escutou o evento: <strong>${dados}</strong>`)
		.addClass('text-primary');
});

// 2. SKELETON LOADING
Facil.dom('#btn-skeleton-on').on('click', () => Facil.ui.skeleton('#card-skeleton', true));
Facil.dom('#btn-skeleton-off').on('click', () => Facil.ui.skeleton('#card-skeleton', false));

// 3. HTTP REQUEST (Com Loading Global Integrado)
Facil.dom('#btn-http').on('click', async () => {
	// Limpa o resultado anterior para vermos o loading agir
	Facil.dom('#http-result').html('Carregando...');
	
	try {
		// Simulando delay para ver a barra de loading animando
		await new Promise(resolve => setTimeout(resolve, 800)); 
		
		const user = await Facil.http.get('https://jsonplaceholder.typicode.com/users/1');
		Facil.dom('#http-result').html(`<strong>${user.name}</strong><br>${user.email}<br>${user.company.name}`);
	} catch (e) {
		Facil.dom('#http-result').html('<span class="text-danger">Erro ao carregar dados.</span>');
	}
});

// 4. FORMULÁRIO E VALIDAÇÃO
// Opcional: Aqui poderíamos usar Facil.form.setMessages({...}) se quiséssemos mudar os textos dinamicamente.

Facil.form.setMessages({
  required: "O campo <b>{field}</b> é obrigatório.",
  email: "Insira um e-mail válido para {field}.",
  min: "O campo {field} precisa ter no mínimo {min} caracteres.",
  max: "O campo {field} não pode passar de {max} caracteres.",
  number: "O valor de {field} deve ser numérico.",
  match: "O campo {field} precisa ser igual ao campo {matchField}."
});

Facil.dom('#form-teste').on('submit', (e) => {
	e.preventDefault();
	
	// Regras de validação super limpas
	const validacao = Facil.form.validate('#form-teste', {
		nome: 'required|min:3',
		email: 'required|email',
		idade: 'required|number',
		senha: 'required|min:6',
		confirmaSenha: 'required|match:senha'
	});

	const divErros = document.getElementById('form-erros');
	
	if (!validacao.isValid) {
	// Exibe os erros
		let htmlErros = '<strong>Corrija os seguintes erros:</strong><ul class="mb-0 mt-1">';
		for (const [campo, mensagem] of Object.entries(validacao.errors)) {
			htmlErros += `<li>${mensagem}</li>`;
		}
		htmlErros += '</ul>';
		
		divErros.innerHTML = htmlErros;
		divErros.classList.remove('d-none');
		Facil.dom('#form-result').html('{}');
	} else {
		// Esconde erros e exibe o JSON pronto para envio
		divErros.classList.add('d-none');
		const jsonFormatado = JSON.stringify(validacao.data, null, 2);
		Facil.dom('#form-result').html(jsonFormatado);
	}
});

//5. Reatividade
const estado = Facil.reactive('#example-reactive', {
	nome: 'João',
	status: 'Aguardando...'
});

setTimeout(() => {
	estado.status = 'Pronto! Timeout de 2s executado!';
}, 2000);

//6. Template engine
const templateUser = `
  <div class="card card-body">
    <h3>{{ nome }}</h3>
    <p>Email: {{ email }}</p>
  </div>
`;

const dados = { nome: 'Maria', email: 'maria@email.com' };
const htmlFinal = Facil.template.parse(templateUser, dados);

Facil.dom('#example-template').html(htmlFinal);

//7. Rotas SPA
Facil.router.init({
  outlet: '#container-spa',
  routes: [
    { 
      path: '/', 
      template: '<h1>Página Inicial</h1><p>Bem-vindo!</p>' 
    },
    { 
      path: '/sobre', 
      templateUrl: '/views/sobre.html', // Faz o fetch do arquivo HTML dinamicamente!
      onLoad: () => console.log('A página sobre terminou de carregar.')
    },
    { 
      path: '*', // Rota 404 de fallback
      template: '<h1>404 - Página não encontrada</h1>' 
    }
  ]
});

// Para navegar via código (num evento de botão, por exemplo):
// Facil.router.navigate('/sobre');