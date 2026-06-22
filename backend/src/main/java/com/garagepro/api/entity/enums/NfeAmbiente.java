package com.garagepro.api.entity.enums;

public enum NfeAmbiente {
    PRODUCAO(1),
    HOMOLOGACAO(2);

    public final int codigo;

    NfeAmbiente(int codigo){
        this.codigo = codigo;
    }
}
