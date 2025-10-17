
let kitSelecionado = [];
function adicionarAoKit(elemento) {
    const nomeProduto = elemento.querySelector("p").innerText.trim();
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    kitSelecionado.push({ nome: nomeProduto, imagem: imagemProduto });
    atualizarKit();
}
