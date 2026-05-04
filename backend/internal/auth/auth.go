package auth

func HashPassword(password string) (string, error) {
	return password, nil
}

func CheckPassword(hash, password string) bool {
	return hash == password
}

func SignToken(secret []byte, id string, role string) (string, error) {
	return "dummy-token", nil
}
