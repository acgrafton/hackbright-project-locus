"use strict";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNewUser: true,
      isLoggedIn: false,
      justRegistered: false,
      completedQuestionaire: false,
    }
    this.setRegistered = this.setRegistered.bind(this);
    this.setLoggedIn = this.setLoggedIn.bind(this);
    this.setCompletedQuestionaire = this.setCompletedQuestionaire.bind(this);
  }

  setRegistered() {
    this.setState({isNewUser: false,
                   justRegistered: true});
  }

  setLoggedIn() {
    this.setState({isLoggedIn: true})
  }

  setCompletedQuestionaire(){
    this.setState({completedQuestionaire: true})
  }

  render(){
    const isNewUser = this.state.isNewUser;
    console.log(isNewUser)
    let userForm;
    if (isNewUser) {
      userForm = <RegisterForm onRegistered={this.setRegistered} /> 
    } else {
      userForm = <LoginForm />
    }

    let showQuestionaire = (this.state.justRegistered && !this.state.completedQuestionaire)

    return (
      <div>
        {userForm}
        {showQuestionaire ? <Questionaire category1={CATEGORY_SET1} category2={CATEGORY_SET2} /> : ""}
      </div> 
    )
  }
}


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

    console.log(data)

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
        // this.setState({isRegistered: true, justRegistered: true})
        this.props.onRegistered;
      } else {
        alert('Unable to create account. Please try again.')
        this.setState({email: '',
                      username: '', 
                      firstName: '',
                      lastName: '',
                      password: '',
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
        <p>Already have an account?</p>
        <button className="btn btn-primary" type="submit">Login</button>
      </div>
    );
  }
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', 
                  password: ''};

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
      username: this.state.username,
      password: this.state.password,
    };

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    };

    fetch('/api/login', fetchData)
    .then(response => response.json())
    .then(data => {
      if (data['success'] === true) {
        alert('You have successfully signed up.')
        this.setState({isLoggedIn: true})
        this.props.setLoggedIn()
      } else {
        alert('This username/password combination is invalid. Try again.')
        this.setState({username: '', 
                      password: '',
                      isLoggedIn: false,
        })
      }
    })
  }

  render() {
    return (
      <div>
        <h2>log in</h2>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              username: 
              <input
                name='username'
                type='text'
                value={this.state.username}
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
          <input type='submit' className='btn btn-login' value='Submit'/>
        </form>
      </div>
    );
  }

}




// class Profile extends React.Component {

// }

// class Criteria extends React.Component {

// }

// class ScoredLocations extends React.Component {

// }
ReactDOM.render(<App />, document.getElementById('root'));