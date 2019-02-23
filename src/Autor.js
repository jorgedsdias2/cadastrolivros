import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import channel from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = {nome: '', email: '', senha: ''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        
        $.ajax({
          url:'http://cdc-react.herokuapp.com/api/autores',
          contentType: 'application/json',
          dataType: 'json',
          type: 'POST',
          data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
          success: function(novaListagem) {
            channel.publish('atualiza-lista-autores', novaListagem);
            this.setState({nome: '', email: '', senha: ''});
          }.bind(this),
          error: function(resposta) {
            if(resposta.status === 400) {
                new TratadorErros().publicaErros(resposta.responseJSON);
            }
          },
          beforeSend: function() {
              channel.publish('limpa-erros', {});
          }
        });
    }
    
    setNome(evento) {
        this.setState({nome: evento.target.value});
    }

    setEmail(evento) {
        this.setState({email: evento.target.value});    
    }

    setSenha(evento) {
        this.setState({senha: evento.target.value});    
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="POST">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} label="Nome" />
                    <InputCustomizado id="email" type="text" name="email" value={this.state.email} onChange={this.setEmail} label="Email" />
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} label="Senha" />
                    <BotaoSubmitCustomizado label="Gravar"/>
                </form>
            </div>  
        )
    }
}

class TabelaAutores extends Component {
    render() {
        return (
            <div>            
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(function(autor) {
                                return (
                                    <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
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

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {lista: []};
    }
    
    componentDidMount() {
        $.ajax({
          url:'http://cdc-react.herokuapp.com/api/autores',
          dataType: 'json',
          success: function(resposta) {
            this.setState({lista:resposta});
          }.bind(this)
        });

        channel.subscribe('atualiza-lista-autores', function(topico, novaLista) {
            this.setState({lista: novaLista})
        }.bind(this));
    }

    render() {
        return (
            <div>
                <FormularioAutor />
                <TabelaAutores lista={this.state.lista} />
            </div>
        )
    }
}