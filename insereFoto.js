const fs = require('fs');
const { Client } = require('pg');

function readFileToBuffer(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function insertPhoto() {
    const client = new Client({
        user: 'postgres',
        host: 'brz-app1.schmersal.com.br',
        database: 'pcs',
        password: 'ace123',
        port: 5432,
    });

    await client.connect();

    try {

        let nomeFoto = 'dt_20240528_hr_161133_ob_11762997_ord_5360891_item_595902_rn_18';

        //Puxa horário do nome da foto
        let data1 = nomeFoto.split("_");
        let horarioCru = data1[3];
        function cadaDoisCaracteres(string) {
            let partes = [];
            for (let i = 0; i < string.length; i += 2) {
                partes.push(string.substring(i, i + 2));
            }
            return partes;
        }
        let resultado = cadaDoisCaracteres(horarioCru);
        let hora = resultado[0];
        let minuto = resultado[1];
        let segundo = resultado[2];

        let horario = ''+hora+':'+minuto+':'+segundo+'';
        console.log(horario)

        // Caminho para a foto
        const localFoto = '\\\\brz-file1\\checklist\\fotosTeste\\'+nomeFoto+'.jpg';

        const foto = await readFileToBuffer(localFoto);

        const sql = `
            INSERT INTO pcs_fotos (
                fot_ordem_compra,
                fot_posicao,
                fot_projeto,
                fot_num_serie,
                fot_data_registro,
                fot_foto,
                fot_estacao_conferencia,
                fot_codigo_produto
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const values = [
            '4503562967',         // ordemCompra
            2,                    // posicao
            '11762997',              // projeto
            '',       // numeroSerie
            new Date('2024-05-28 '+horario+''), // dataRegistro
            foto,                 // foto (Buffer)
            'brz-prod517',        // estacaoConferencia
            '59713604'            // codigoProduto (codigoItemCliente no devtools)
        ];

        await client.query(sql, values);

        console.log('Dados da foto '+nomeFoto+' inseridos com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir dados:', err);
    } finally {
        await client.end();
    }
}

insertPhoto();