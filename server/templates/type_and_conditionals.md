$title$
$if:creators:lengthequals_to_1$
Single author : $creators[0].lastName:uppercase$ $creators[0].firstName$
$endif:creators:lengthequals_to_1$


$if:creators:lengthsuperior_to_1$
Multiple authors :
$loop:author in creators:separator=, :terminator=.$
$author.lastName:uppercase$ $author.firstName:initials$
$endloop:author in creators$
$endif:creators:lengthsuperior_to_1$

Year : $date:year$
