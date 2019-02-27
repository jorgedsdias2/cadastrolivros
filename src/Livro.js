import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import channel from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {
    constructor() {
        super();
        this.state = {titulo: '', preco: '', autorId: ''};
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();

        $.ajax({
            url: 'https://cdc-react.herokuapp.com/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: function(novaListagem) {
                channel.publish('atualiza-lista-livros', novaListagem);
                this.setState({titulo: '', preco: '', autorId: ''});
            }.bind(this),
            error: function(resposta) {
                if(resposta === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function() {
                channel.publish('limpa-erros', {});
            }
        });
    }

    salvaAlteracao(nomeInput, evento) {
        var campoAlterado = {};
        campoAlterado[nomeInput] = evento.target.value;
        this.setState(campoAlterado);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="POST">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this, 'titulo')} label="Título" />

                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this, 'preco')} label="Preço" />

                    <div className="pure-controls">
                        <select value={this.state.autorId} name="autorId" onChange={this.salvaAlteracao.bind(this, 'autorId')}>
                            <option value="">Selecione</option>
                            {
                                this.props.autores.map(function(autor) {
                                    return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                    </div>
                    <BotaoSubmitCustomizado label="Gravar"/>
                </form>
            </div>
        )
    }
}

class TabelaLivros extends Component {
    render() {
        return (
            <div>            
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(function(livro) {
                                return (
                                    <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.autor.nome}</td>
                                    <td>{livro.preco}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>            
        )
    }
}

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {lista: [], autores: []};
    }

    componentDidMount() {
        $.ajax({
            url:'http://cdc-react.herokuapp.com/api/livros',
            dataType: 'json',
            success: function(resposta) {
              this.setState({lista:resposta});
            }.bind(this)
        });

        $.ajax({
            url:'http://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: function(resposta) {
              this.setState({autores:resposta});
            }.bind(this)
        });
  
        channel.subscribe('atualiza-lista-livros', function(topico, novaLista) {
              this.setState({lista: novaLista})
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                  <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros lista={this.state.lista} />
                </div>
            </div>
        )
    }
}