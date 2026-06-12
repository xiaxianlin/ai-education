package db

type ManagerTokenRecord struct {
	ID         string
	Username   string
	Type       int
	Status     int
	CreateTime int64
	UpdateTime *int64
}

type ManagerRecord struct {
	ID         string
	Username   string
	Password   string
	Token      *string
	Type       int
	Status     int
	CreateTime int64
	UpdateTime *int64
}

type StudentTokenRecord struct {
	ID         string
	Name       string
	Phone      string
	Grade      *int
	Semester   *string
	Subject    *string
	Status     int
	CreateTime int64
	UpdateTime *int64
}
