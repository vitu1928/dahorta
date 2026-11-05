package com.dahorta.api.service;

import com.dahorta.api.entity.Produto;
import com.dahorta.api.repository.ProdutoRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CatalogoProdutosInitializer implements ApplicationRunner {

    private final ProdutoRepository produtoRepository;

    public CatalogoProdutosInitializer(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (produtoRepository.count() > 0) {
            return;
        }

        produtoRepository.saveAll(List.of(
                produto("Bowl Proteico", "Quinoa, frango grelhado organico, abacate, tomate cereja, espinafre e molho tahine.", "/assets/bowl_proteico.png", "Bowls", "28.90"),
                produto("Bowl Vegano Power", "Grao-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.", "/assets/bowl_vegano.png", "Bowls", "24.90"),
                produto("Bowl Mediterraneo", "Arroz integral, salmao grelhado, pepino, azeitonas, tomate e molho de iogurte.", "/assets/bowl_mediterraneo.png", "Bowls", "32.90"),
                produto("Bowl Low-Carb Frango", "Arroz de couve-flor, frango grelhado premium, brocolis ao bafo, ovo cozido e sementes de gergelim.", "/assets/bowl_low_carb.png", "Bowls", "29.90"),
                produto("Bowl Asiatico", "Macarrao de arroz, tofu defumado, edamame, cogumelos shitake e molho de soja e gengibre.", "/assets/bowl_oriental.png", "Bowls", "31.90"),
                produto("Salada Caesar Organica", "Alface romana organica, croutons artesanais, parmesao e molho caesar caseiro.", "https://i.imgur.com/BM0eoHE.jpeg", "Saladas", "22.90"),
                produto("Suco de Laranja Organico", "Suco de laranja 100% natural e organico, sem adicao de acucar ou conservantes. 400ml.", "https://i.imgur.com/D5fUFkH.jpeg", "Bebidas", "12.90"),
                produto("Pink Lemonade Natural", "Limao siciliano, framboesa natural e agua gaseificada. Uma explosao de sabor. 400ml.", "https://i.imgur.com/qpBWUlU.jpeg", "Bebidas", "15.90"),
                produto("Kombucha de Gengibre", "Bebida fermentada milenar, naturalmente gaseificada e probiotica. 300ml.", "https://i.imgur.com/xcjjl0M.jpeg", "Bebidas", "18.90"),
                produto("Cha Mate com Limao", "Mate artesanal batido com limao e gelo. Sabor carioca e natural. 400ml.", "https://i.imgur.com/PLxpqrU.jpeg", "Bebidas", "11.90"),
                produto("Agua Mineral Alcalina", "Agua mineral alcalina de PH elevado para hidratacao maxima. 500ml.", "https://i.imgur.com/J6fsFty.jpeg", "Bebidas", "6.90"),
                produto("Bowl de Acai Organico", "Acai puro batido com banana, coberto com granola artesanal, frutas frescas e mel.", "https://i.imgur.com/UWcS8Go.jpeg", "Sobremesas", "26.90"),
                produto("Mousse de Cacau Raw", "Mousse de cacau cru com abacate, tamaras e castanhas. Vegano e sem acucar refinado.", "https://i.imgur.com/ihFpYkN.jpeg", "Sobremesas", "18.90"),
                produto("Chia Pudding de Coco", "Sementes de chia hidratadas no leite de coco, com laminas de coco e morangos. Vegano.", "https://i.imgur.com/mfV8k60.jpeg", "Sobremesas", "21.90"),
                produto("Cheesecake de Frutas Vermelhas", "Cheesecake vegano com base de amendoas e calda caseira de frutas vermelhas.", "https://i.imgur.com/A5w2xJK.jpeg", "Sobremesas", "24.90"),
                produto("Brownie de Batata Doce", "Brownie denso e chocolatudo, adocado naturalmente, sem gluten e sem lactose.", "https://i.imgur.com/RVx4FyV.jpeg", "Sobremesas", "16.90"),
                produto("Salada de Frutas Tropical", "Mix de frutas da estacao rigorosamente selecionadas com suco de laranja.", "https://i.imgur.com/hVEpQWR.jpeg", "Sobremesas", "14.90"),
                produto("Pao Integral Artesanal", "Pao 100% integral com sementes de chia, linhaca e girassol. 2 fatias.", "https://i.imgur.com/uvBI6kE.jpeg", "Acompanhamentos", "8.90"),
                produto("Batata Doce com Alecrim", "Cubos de batata doce organica assados com azeite e alecrim fresco.", "https://i.imgur.com/jygmHBo.jpeg", "Acompanhamentos", "12.90"),
                produto("Chips de Mandioca", "Laminas crocantes de mandioca preparadas na airfryer com sal marinho.", "https://i.imgur.com/c8aI4Ez.jpeg", "Acompanhamentos", "10.90"),
                produto("Mix de Vegetais Grelhados", "Abobrinha, berinjela e pimentoes grelhados com ervas finas.", "https://i.imgur.com/mviwuIq.jpeg", "Acompanhamentos", "15.90"),
                produto("Combo Casal Fitness", "2 Bowls a escolha + 2 Sucos Detox com um desconto especial.", "/assets/bowl_proteico.png", "Bowls", "79.90")
        ));
    }

    private Produto produto(String nome, String descricao, String imagem, String categoria, String preco) {
        return new Produto(nome, descricao, imagem, categoria, new BigDecimal(preco), true, List.of());
    }
}
