"use strict";


class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {email: '',
                  username: '', 
                  firstName: '',
                  lastName: '',
                  password: '',
                  isRegistered: false};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }
  handleInputChange(event) {

    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const data = {
      email: this.state.email,
      username: this.state.username,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      password: this.state.password,
    };

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    };

    fetch('/api/new_user', fetchData)
    .then(response => response.json())
    .then(data => {
      if (data['success'] === true) {
        alert('You have successfully signed up.')
        this.setState({isRegistered: true})
      } else {
        alert('Unable to create account. Please try again.')
        this.setState({email: '',
                      username: '', 
                      firstName: '',
                      lastName: '',
                      password: '',
                      isRegistered: false,
        })
      }
    })
  }

  render() {
    return (
      <div>
        <h2>sign up</h2>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              email: 
              <input
                name='email'
                type='email'
                value={this.state.email}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label htmlFor="username">
              username: 
              <input
                name='username'
                type='text'
                value={this.state.username}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label htmlFor="firstName">
              first name: 
              <input
                name='firstName'
                type='text'
                value={this.state.firstName}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label htmlFor="lastName">
              last name: 
              <input
                name='lastName'
                type='text'
                value={this.state.lastName}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label htmlFor="password">
              password: 
              <input
                name='password'
                type='password'
                value={this.state.password}
                onChange={this.handleInputChange} />
            </label>
            <br/>
          </div>
          <input type='submit' className='btn btn-reg' value='Submit'/>
        </form>
      </div>
    );
  }
}

// class Login extends React.Component {

// }



// class Homepage extends React.Component {
//   render(){
//     pass;
//   }
// }


// class Questionaire extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       criteria: {}
//     };
//   }
//   render(){
//     return(
//         <div>
//         <form action="/questionaire" method="POST" id='q-form'>
//         </form>
//       </div>
//     );
//   }
// }

// class Profile extends React.Component {

// }

// class Criteria extends React.Component {

// }

// class ScoredLocations extends React.Component {

// }
ReactDOM.render(<RegisterForm />, document.getElementById('root'));